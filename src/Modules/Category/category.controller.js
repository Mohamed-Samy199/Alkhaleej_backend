import cloudinary from "../../Utils/cloudinary.js";
import categoryModel from "../../../DB/Model/category.model.js";
import slugify from "slugify";
import translate from "translate-google";
import subcategoryModel from "../../../DB/Model/subcategory.model.js";
import productModel from "../../../DB/Model/product.model.js";

export const getCategory = async (req, res, next) => {
    const category = await categoryModel.find({}).populate([
        {
            path: "subcategory",
            select: "_id name translations image slug product",
            populate: [
                {
                    path: "product"
                }
            ]
        },
        {
            path: "product"
        },
        {
            path: "brand"
        }
    ]).select("_id name translations image slug subcategory product brand")

    return res.status(200).json({ message: "Done", category })
};
export const createCategorey = async (req, res, next) => {
    const toLanguage = "en";
    const name = req.body.name.toLowerCase();
    const slug = slugify(name);

    
        if (await categoryModel.findOne({ name })) {
            return next(new Error(`Duplicate category name ${name}`, { cause: 409 }));
        }

        const translations = await translate(name, { from: "auto", to: toLanguage });

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.APP_NAME}/category`,
            format: 'webp',  // Specify the desired format
            flags: 'lossy',  // Optional flag for lossy compression
        });

        const category = await categoryModel.create({
            name,
            slug,
            image: { secure_url: result.secure_url, public_id: result.public_id },
            createdBy: req.user._id,
            translations: {
                en: translations,
                ar: name,
            },
        });

        return res.status(201).json({ message: "Done", category });
    
};
export const deleteCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    let category = await categoryModel.findByIdAndDelete(categoryId);
    if (!category) {
        return next(new Error("Can't find this Category", { cause: 400 }));
    }
    await subcategoryModel.deleteMany({ categoryId });
    await productModel.deleteMany({ categoryId });

    await cloudinary.uploader.destroy(category.image.public_id);
    return res.status(200).json({ message: "Deleted Successfully", category })
};