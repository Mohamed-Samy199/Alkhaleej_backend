import mongoose, { Schema, Types, model } from "mongoose";

const categorySchema = new Schema({
    name: { type: String, required: true, trim: true, lowerCase: true },
    image: { type: Object, required: true },
    slug: { type: String, required: true, trim: true, lowerCase: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    translations: {
        en: { type: String, trim: true },
        ar: { type: String, trim: true },
        // Add more languages if needed
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }

});
categorySchema.virtual("subcategory", {
    localField: "_id",
    foreignField: "categoryId",
    ref: "Subcategory"
})
categorySchema.virtual('product', {
    localField: "_id",
    foreignField: "categoryId",
    ref: "Product"
})
categorySchema.virtual('brand', {
    localField: "_id",
    foreignField: "categoryId",
    ref: "Brand"
})

const categoryModel = mongoose.models.Category || model('Category', categorySchema);
export default categoryModel;