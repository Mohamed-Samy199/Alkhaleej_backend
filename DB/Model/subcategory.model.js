import mongoose, { Schema, Types, model } from "mongoose";

const subcategorySchema = new Schema({
    name: { type: String, required: true, trim: true, lowerCase: true },
    image: { type: Object, required: true },
    slug: { type: String, required: true, trim: true, lowerCase: true },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    createBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    customId: { type: String, required: true, unique: true },
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

subcategorySchema.virtual('product', {
    ref: "Product",
    localField: "_id",
    foreignField: "subcategoryId"
})

const subcategoryModel = mongoose.models.Subcategory || model('Subcategory', subcategorySchema);
export default subcategoryModel;