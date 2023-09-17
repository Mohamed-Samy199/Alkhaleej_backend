import brandModel from "../../../DB/Model/brand.model.js";
import categoryModel from "../../../DB/Model/category.model.js";
import cloudinary from "../../Utils/cloudinary.js";

export const getBrand = async (req, res, next) => {
    const brand = await brandModel.find({}).populate([
        { path: "product" }
    ]);
    return res.status(200).json({ message: "Done", brand })
}
export const getSameBrand = async (req, res, next) => {
    const { _id } = req.params;
    const brand = await brandModel.findById(_id).populate([
        { path: "product" }
    ]);
    return res.status(200).json({ message: "Done", brand })
}
export const createBrand = async (req, res, next) => {
    // update
    const { categoryId } = req.body;
    if (! await categoryModel.findOne({ _id: categoryId })) {
        return next(new Error("In-valid category or subcategory id", { cause: 400 }));
    }
    const name = req.body.name.toLowerCase();
    if (await brandModel.findOne({ name })) {
        return next(new Error(`Dublicate brand name ${name}`, { cause: 409 }))
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/brand` });
    const brand = await brandModel.create({
        name,
        categoryId,
        createBy: req.user._id,
        image: { secure_url, public_id }
    });
    return res.status(201).json({ message: "Done", brand });
}
export const updateBrand = async (req, res, next) => {
    const brand = await brandModel.findById(req.params.brandId)
    if (!brand) {
        return next(new Error(`In-valid brand id`, { cause: 400 }));
    }
    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase();
        if (brand.name == req.body.name) {
            return next(new Error(`Sorry, can not update brand`, { cause: 400 }));
        }
        if (await brandModel.findOne({ name: req.body.name })) {
            return next(new Error(`Dublicate brand name ${req.body.name}`, { cause: 409 }));
        }
        brand.name = req.body.name;
    }
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/brand` });
        await cloudinary.uploader.destroy(brand.image.public_id);
        brand.image = { secure_url, public_id };
    }
    brand.updatedBy = req.user._id;
    await brand.save();
    return res.status(200).json({ message: "Done", brand })
}
