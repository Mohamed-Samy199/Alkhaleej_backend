import slugify from "slugify";
import subcategoryModel from "../../../DB/Model/subcategory.model.js";
import cloudinary from "../../Utils/cloudinary.js";
import { nanoid } from "nanoid";
import categoryModel from "../../../DB/Model/category.model.js";
import translate from "translate-google";
import productModel from "../../../DB/Model/product.model.js";

export const getSubCategory = async (req, res, next) => {
    const subcategory = await subcategoryModel.find({}).populate([
        {
            path: "categoryId",
            select: "_id name translations image slug product"
        },
        {
            path: "product"
        }
    ]).select("_id name image translations slug categoryId product")
    return res.status(200).json({ message: "Subcategory Module", subcategory });
};
export const createSubcategory = async (req, res, next) => {
    const toLanguage = "en";
    const { categoryId } = req.params;
    const subcategory = await categoryModel.findById(categoryId);
    if (!subcategory) {
        return next(new Error("In-valid category id", { cause: 400 }));
    }
    const name = req.body.name.toLowerCase();
    if (await subcategoryModel.findOne({ name })) {
        return next(new Error(`Dublicate subcategory name ${name}`, { cause: 409 }));
    }
    const slug = slugify(name);
    const customId = nanoid(6)
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { 
        folder: `${process.env.APP_NAME}/category/${categoryId}/${customId}`,
        format: 'webp',  // Specify the desired format
        flags: 'lossy',  // Optional flag for lossy compression
    });
    const translations = await translate(name, { from: "auto", to: toLanguage });

    const addSubcategory = await subcategoryModel.create({
        name,
        slug,
        customId,
        categoryId,
        createBy: req.user._id,
        image: { secure_url, public_id },
        translations: {
            en: translations,
            ar: name,
        },
    });
    return res.status(201).json({ message: "Done", addSubcategory });
};
export const deleteSubcategory = async (req, res, next) => {
    const { categoryId, subcategoryId } = req.params;
    const deletedSubcategory = await subcategoryModel.findByIdAndDelete(subcategoryId, { new: true });
    if (!deletedSubcategory) {
        return next(new Error("Can't find this Sub Category", { cause: 400 }));
    }
    await productModel.deleteMany({ subcategoryId });
    await categoryModel.updateOne({ _id: categoryId }, { $pull: { subcategory: subcategoryId } }).exec()
    await cloudinary.uploader.destroy(deletedSubcategory.image.public_id);
    return res.status(200).json({ message: "Deleted Successfully" });
};