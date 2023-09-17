import cloudinary from "../../Utils/cloudinary.js";
import categoryModel from "../../../DB/Model/category.model.js";
import slugify from "slugify";
import subcategoryModel from "../../../DB/Model/subcategory.model.js";

export const getCategory = async (req, res, next) => {
    const category = await categoryModel.find({}).populate([
        {
            path: "subcategory",
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
    ])
    return res.status(200).json({ message: "Done", category })
}
export const createCategorey = async (req, res, next) => {
    const name = req.body.name.toLowerCase();
    const slug = slugify(name);
    if (await categoryModel.findOne({ name })) {
        return next(new Error(`Dublicate category name ${name}`, { cause: 409 }))
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/category` })
    const category = await categoryModel.create({ name, slug, image: { secure_url, public_id }, createdBy: req.user._id });
    return res.status(201).json({ message: "Done", category });
}

export const updateCategory = async (req, res, next) => {
    const category = await categoryModel.findById(req.params.categoryId)
    if (!category) {
        return next(new Error(`In-valid category id`, { cause: 400 }));
    }

    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase();
        if (category.name == req.body.name) {
            return next(new Error(`Sorry, can not update category`, { cause: 400 }));
        }
        if (await categoryModel.findOne({ name: req.body.name })) {
            return next(new Error(`Dublicate category name ${req.body.name}`, { cause: 409 }));
        }
        category.name = req.body.name;
        category.slug = slugify(req.body.name);
    }
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/category` });
        await cloudinary.uploader.destroy(category.image.public_id);
        category.image = { secure_url, public_id };
    }
    category.updatedBy = req.user._id
    await category.save();
    return res.status(200).json({ message: "Done", category })
}