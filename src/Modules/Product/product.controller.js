import slugify from "slugify";
import brandModel from "../../../DB/Model/brand.model.js";
import subcategoryModel from "../../../DB/Model/subcategory.model.js";
import { nanoid } from "nanoid";
import cloudinary from "../../Utils/cloudinary.js";
import productModel from "../../../DB/Model/product.model.js";
import userModel from "../../../DB/Model/user.model.js";
import { paginate } from "../../Utils/paginate.js";
import ApiFeatuers from "../../Utils/apiFeatures.js";

export const getProduct = async (req, res, next) => {
    const apiFeatuers = new ApiFeatuers(productModel.find().populate([
        {
            path: "review"
        }
    ]), req.query)
    // .paginate().filter().sort().select()
    const products = await apiFeatuers.mongooseQuery;
    for (let i = 0; i < products.length; i++) {
        let calcRating = 0;
        for (let j = 0; j < products[i].review.length; j++) {
            calcRating += products[i].review[j].rate
        }
        let avgRating = calcRating / products[i].review.length;
        const product = products[i].toObject();
        product.avgRating = avgRating;
        products[i] = product
    }
    return res.status(200).json({ message: "Done", products })




    // const {skip , limit} = paginate(req.query.page , req.query.size);
    // const excludeQueryParams = ['sort' , 'size' , 'page' , 'fields' , 'search'];
    // const filterQuery = {...req.query};
    // excludeQueryParams.forEach(param => {
    //     delete filterQuery[param]
    // })

    // console.log(req.query);
    // console.log(JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte|eq|neq|in|nin)/g , match => `$${match}`)));


    // const products = await productModel.find(JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte|eq|neq|in|nin)/g , match => `$${match}`))).populate([{
    //     path : "review"
    // }]).limit(limit).skip(skip)

    // const products = await productModel.find(JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte|eq|neq|in|nin)/g , match => `$${match}`))).populate([{
    //     path : "review"
    // }]).sort(req.query.sort.replaceAll(',' , ' '))

    // for (let i = 0 ; i < products.length ; i++){
    //     let calcRating = 0;
    //     for (let j = 0; j < products[i].review.length ; j++) {
    //         calcRating += products[i].review[j].rate
    //     }
    //     let avgRating = calcRating / products[i].review.length;
    //     const product = products[i].toObject();
    //     product.avgRating = avgRating;
    //     products[i] = product
    // }
    // res.status(200).json({message : "Done" , products})
}
export const getProductDetails = async (req, res, next) => {
    const { _id } = req.params;
    const product = await productModel.findById(_id).populate([
        {
            path: "review"
        }
    ])
    return res.status(200).json({ message: "Done", product })
}
export const createProduct = async (req, res, next) => {
    const { name, price, discount, categoryId, subcategoryId, brandId } = req.body;
    if (! await subcategoryModel.findOne({ _id: subcategoryId, categoryId })) {
        return next(new Error("In-valid category or subcategory id", { cause: 400 }));
    }
    if (! await brandModel.findOne({ _id: brandId })) {
        return next(new Error("In-valid brand id", { cause: 400 }));
    }
    req.body.slug = slugify(name, {
        replacement: "-",
        trim: true,
        lower: true
    })
    req.body.finalPrice = Number.parseFloat(price - (price * ((discount || 0) / 100))).toFixed(2) // -200 50%->100 = 200 -(200 * (50 / 100)) = 200 -  100 =100
    req.body.customId = nanoid();
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: `${process.env.APP_NAME}/product/${req.body.customId}` });
    req.body.mainImage = { secure_url, public_id };
    if (req.files.subImages) {
        req.body.subImages = []
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/product/${req.body.customId}/subImages` });
            req.body.subImages.push({ secure_url, public_id });
        }
    }
    req.body.createdBy = req.user._id;
    const product = await productModel.create(req.body);
    if (!product) {
        return next(new Error("Fail to create product", { cause: 400 }))
    }
    return res.status(201).json({ message: "Done", product })
}
export const updateProduct = async (req, res, next) => {
    const { productId } = req.params;
    const { name, price, discount, categoryId, subcategoryId, brandId } = req.body;
    // check product exist
    const productExist = await productModel.findById(productId);
    if (!productExist) {
        return next(new Error("In-valid product id", { cause: 400 }));
    }
    // check category or subcategory & brand exist
    if (categoryId && subcategoryId) {
        if (! await subcategoryModel.findOne({ _id: subcategoryId, categoryId })) {
            return next(new Error("In-valid category or subcategory id", { cause: 400 }));
        }
    }
    if (brandId) {
        if (! await brandModel.findOne({ _id: brandId })) {
            return next(new Error("In-valid brand id", { cause: 400 }));
        }
    }
    // update slug
    if (name) {
        req.body.slug = slugify(name, {
            replacement: "-",
            trim: true,
            lower: true
        })
    }
    // update price 
    if (price && discount) {
        req.body.finalPrice = Number.parseFloat(price - (price * ((discount) / 100))).toFixed(2)
    } else if (price) {
        req.body.finalPrice = Number.parseFloat(price - (price * ((productExist.discount || 0) / 100))).toFixed(2)
    } else if (discount) {
        req.body.finalPrice = Number.parseFloat(productExist.price - (productExist.price * ((discount || 0) / 100))).toFixed(2)
    }
    // update images
    if (req.files?.mainImage?.length) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: `${process.env.APP_NAME}/product/${productExist.customId}` });
        await cloudinary.uploader.destroy(productExist.mainImage.public_id);
        req.body.mainImage = { secure_url, public_id };
    }
    if (req.files?.subImages?.length) {
        req.body.subImages = []
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/product/${productExist.customId}/subImages` });
            req.body.subImages.push({ secure_url, public_id });
        }
    }

    req.body.updatedBy = req.user._id;
    const product = await productModel.updateOne({ _id: productExist._id }, req.body);
    if (product.matchedCount) {
        return res.status(200).json({ message: "Done" })
    }

}

export const getWishlist = async (req, res, next) => {
    const wishlist = await userModel.findOne({ _id: req.user._id }).select("wishlist")
    if (!wishlist) {
        return next(new Error("not there wishlist", { cause: 404 }))
    }

    let numOfCartItems = wishlist.wishlist.length;
    return res.status(200).json({ message: "Done", wishlist, numOfCartItems })
}

export const addToWishlist = async (req, res, next) => {
    const { productId } = req.body;
    if (! await productModel.findById(productId)) {
        return next(new Error("In-valid product", { cause: 400 }))
    }
    const wishlist = await userModel.findOneAndUpdate({ _id: req.user._id }, { $addToSet: { wishlist: productId } }, { new: true })
    if (!wishlist) {
        return next(new Error("can not add to wishlist", { cause: 400 }))
    }
    let numOfCartItems = wishlist.wishlist.length;
    return res.status(200).json({ message: "Done", wishlist: wishlist.wishlist, numOfCartItems })
}
export const removeFromWishlist = async (req, res, next) => {
    const { productId } = req.body;
    await userModel.updateOne({ _id: req.user._id }, { $pull: { wishlist: productId } }, { new: true })
    return res.status(200).json({ message: "Done" })
}