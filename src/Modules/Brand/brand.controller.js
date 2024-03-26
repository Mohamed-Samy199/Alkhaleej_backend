import translate from "translate-google";
import brandModel from "../../../DB/Model/brand.model.js";
import categoryModel from "../../../DB/Model/category.model.js";
import cloudinary from "../../Utils/cloudinary.js";
import productModel from "../../../DB/Model/product.model.js";

export const getBrand = async (req, res, next) => {
    const brand = await brandModel.find({}).select("_id name translations image");
    return res.status(200).json({ message: "Done", brand });
}
export const getSameBrand = async (req, res, next) => {
    const { _id } = req.params;
    const brand = await brandModel.findById(_id).populate([
        {
            path: "product",
            select: "_id name translations price finalPrice discount mainImage"
        }
    ]).select("_id translations name")

    return res.status(200).json({ message: "Done", brand })
}
export const createBrand = async (req, res, next) => {
    const toLanguage = "en";
    // update
    const { categoryId } = req.body;
    if (! await categoryModel.findOne({ _id: categoryId })) {
        return next(new Error("In-valid category or subcategory id", { cause: 400 }));
    }
    const name = req.body.name.toLowerCase();
    if (await brandModel.findOne({ name })) {
        return next(new Error(`Dublicate brand name ${name}`, { cause: 409 }))
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.APP_NAME}/brand`,
        format: 'webp',  // Specify the desired format
        flags: 'lossy',  // Optional flag for lossy compression
    });
    const translations = await translate(name, { from: "auto", to: toLanguage });

    const brand = await brandModel.create({
        name,
        categoryId,
        createBy: req.user._id,
        image: { secure_url, public_id },
        translations: {
            en: translations,
            ar: name,
        },
    });
    return res.status(201).json({ message: "Done", brand });
}
export const deleteBrand = async (req, res, next) => {
    let brand = await brandModel.findByIdAndDelete(req.params.brandId, { new: true });
    if (!brand) {
        return next(new Error('Invalid Brand Id', { cause: 400 }));
    }
    // remove all products belong to this brand
    await productModel.deleteMany({ brandId: brand._id });
    await categoryModel.updateOne({ _id: brand.categoryId }, { $pull: { brand: req.params.brandId } }).exec()
    await cloudinary.uploader.destroy(brand.image.public_id);

    return res.status(200).json({ message: "Deleted" });
};
