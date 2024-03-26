import slugify from "slugify";
import brandModel from "../../../DB/Model/brand.model.js";
import subcategoryModel from "../../../DB/Model/subcategory.model.js";
import { nanoid } from "nanoid";
import cloudinary from "../../Utils/cloudinary.js";
import productModel from "../../../DB/Model/product.model.js";
import { paginate } from "../../Utils/paginate.js";
import ApiFeatuers from "../../Utils/apiFeatures.js";
import translate from "translate-google";
import userModel from "../../../DB/Model/user.model.js";

export const getProduct = async (req, res, next) => {
    const apiFeatuers = new ApiFeatuers(productModel.find().populate([
        {
            path: "review"
        },
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
    const productSlug = products.slug; // Add this line to get the slug

    return res.status(200).json({ message: "Done", products , productSlug });
};
export const getProductDetails = async (req, res, next) => {
    const { _id } = req.params;
    const product = await productModel.findById(_id).populate([
        {
            path: "review"
        },
        {
            path: "brandId" , select : "name"
        }
    ]);
    if (!product) return res.status(400).json({ error: 'No Product Found' });

    const productName = product.name;
    const productDescription = product.description;
    const toLanguage = "en"; // Set the target language here
    // Translate subcategory names
    const translations = await translate(productName, { from: "auto", to: toLanguage });
    product.translations[toLanguage] = translations;
    // Translate product description
    const descriptionTranslation = await translate(productDescription, { from: "auto", to: toLanguage });
    product.translationsDesc[toLanguage].description = descriptionTranslation;

    return res.status(200).json({ message: "Done", product })
};
export const createProduct = async (req, res, next) => {
    const { name, price, discount, categoryId, subcategoryId, brandId, description } = req.body;
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
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { 
        folder: `${process.env.APP_NAME}/product/${req.body.customId}`,
        format: 'webp',  // Specify the desired format
        flags: 'lossy',  // Optional flag for lossy compression
    });
    req.body.mainImage = { secure_url, public_id };
    if (req.files.subImages) {
        req.body.subImages = []
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { 
                folder: `${process.env.APP_NAME}/product/${req.body.customId}/subImages`,
                format: 'webp',  // Specify the desired format
                flags: 'lossy',  // Optional flag for lossy compression
            });
            req.body.subImages.push({ secure_url, public_id });
        }
    }
    req.body.createdBy = req.user._id;
    // Translate the category name to the target language
    const toLanguage = "en";
    const translations = await translate(name, { from: "auto", to: toLanguage });
    const translationsDesc = await translate(description, { from: "auto", to: toLanguage })
    req.body.translations = { en:  translations, ar: name };
    req.body.translationsDesc = {
        ar: { description },
        en: { description: translationsDesc },
    }

    const product = await productModel.create(req.body);
    if (!product) {
        return next(new Error("Fail to create product", { cause: 400 }))
    }
    return res.status(201).json({ message: "Done", product })
};
export const deleteProduct = async (req, res, next) => {
    const { productId } = req.params;
    const productExist = await productModel.findById(productId);
    if (!productExist) {
        return next(new Error("Invalid Product Id", { cause: 400 }))
    }
    await cloudinary.uploader.destroy(productExist.mainImage.public_id);
    for (let image of productExist.subImages) {
        await cloudinary.uploader.destroy(image.public_id);
    }
    await productModel.findOneAndDelete({ _id: productId }, { new: true });
    return res.status(200).json({ message: "Deleted Successfully!" });
};




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