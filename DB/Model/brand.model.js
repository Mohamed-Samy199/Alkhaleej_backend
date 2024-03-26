import mongoose, { Schema, Types, model } from "mongoose";

const brandSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true, lowerCase: true },
    image: { type: Object },
    createBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },

    // update
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
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

brandSchema.virtual('product', {
    localField: "_id",
    foreignField: "brandId",
    ref: "Product"
})

const brandModel = mongoose.models.Brand || model('Brand', brandSchema);
export default brandModel;