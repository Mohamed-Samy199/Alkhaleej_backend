import slugify from "slugify";
import subcategoryModel from "../../../DB/Model/subcategory.model.js";
import cloudinary from "../../Utils/cloudinary.js";
import { nanoid } from "nanoid";
import categoryModel from "../../../DB/Model/category.model.js";

export const getSubCategory = async (req, res, next) => {
    const subcategory = await subcategoryModel.find({}).populate([
        {
            path: "categoryId"
        },
        {
            path: "product"
        }
    ])
    return res.status(200).json({ message: "Subcategory Module", subcategory })
}
export const createSubcategory = async (req, res, next) => {
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
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/category/${categoryId}/${customId}` })
    const addSubcategory = await subcategoryModel.create({
        name, slug, customId, categoryId, createBy: req.user._id, image: { secure_url, public_id }
    });
    return res.status(201).json({ message: "Done", addSubcategory });
}
export const updateSubcategory = async (req, res, next) => {
    const { categoryId, subcategoryId } = req.params;
    const subcategory = await subcategoryModel.findOne({ categoryId, _id: subcategoryId })
    if (!subcategory) {
        return next(new Error(`In-valid subcategory id`, { cause: 400 }));
    }

    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase();
        if (subcategory.name == req.body.name) {
            return next(new Error(`Sorry, can not update subcategory`, { cause: 400 }));
        }
        if (await categoryModel.findOne({ name: req.body.name })) {
            return next(new Error(`Dublicate subcategory name ${req.body.name}`, { cause: 409 }));
        }
        subcategory.name = req.body.name;
        subcategory.slug = slugify(req.body.name);
    }
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.APP_NAME}/category/${categoryId}/${subcategory.customId}`
        });
        await cloudinary.uploader.destroy(subcategory.image.public_id);
        subcategory.image = { secure_url, public_id };
    }
    subcategory.updatedBy = req.user._id;
    await subcategory.save();
    return res.status(200).json({ message: "Done", subcategory })
}




// import slugify from "slugify";
// import subcategoryModel from "../../../DB/Model/subcategory.model.js";
// import cloudinary from "../../Utils/cloudinary.js";
// import { nanoid } from "nanoid";
// import categoryModel from "../../../DB/Model/category.model.js";

// export const getSubCategory = async (req , res , next) =>{
//     const subcategory = await subcategoryModel.find({}).populate([
//         {
//             path : "categoryId"
//         }
//     ])
//     return res.status(200).json({message : "Subcategory Module" , subcategory})
// }
// export const createSubcategory = async (req , res , next) =>{
//     const {categoryId} = req.params;
//     const subcategory  = await categoryModel.findById(categoryId);
//     if(!subcategory){
//         return next(new Error("In-valid category id" , {cause : 400}));
//     }
//     const name = req.body.name.toLowerCase();
//     if (await subcategoryModel.findOne({name})) {
//         return next(new Error(`Dublicate subcategory name ${name}` , {cause : 409}));
//     }
//     const slug = slugify(name);
//     const customId = nanoid(6)
//     const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {folder : `${process.env.APP_NAME}/category/${categoryId}/${customId}`})
//     const addSubcategory  = await subcategoryModel.create({
//         name , slug , customId , categoryId , createBy: req.user._id , image :{secure_url , public_id}});
//     return res.status(201).json({message : "Done" , addSubcategory});
// }
// export const updateSubcategory = async (req , res , next) =>{
//     const {categoryId , subcategoryId} = req.params;
//     const subcategory = await subcategoryModel.findOne({categoryId , _id : subcategoryId})
//     if (!subcategory) {
//         return next(new Error(`In-valid subcategory id` , {cause : 400}));
//     }

//     if (req.body.name) {
//         req.body.name = req.body.name.toLowerCase();
//         if (subcategory.name == req.body.name) {
//             return next(new Error(`Sorry, can not update subcategory` , {cause : 400}));
//         }
//         if(await categoryModel.findOne({name : req.body.name})){
//             return next(new Error(`Dublicate subcategory name ${req.body.name}` , {cause : 409}));
//         }
//         subcategory.name = req.body.name;
//         subcategory.slug = slugify(req.body.name);
//     }
//     if(req.file){
//         const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path , {
//             folder :`${process.env.APP_NAME}/category/${categoryId}/${subcategory.customId}`
//         });
//         await cloudinary.uploader.destroy(subcategory.image.public_id);
//         subcategory.image = {secure_url , public_id};
//     }
//     subcategory.updatedBy = req.user._id;
//     await subcategory.save();
//     return res.status(200).json({message : "Done" , subcategory})
// }