import mongoose, { Schema, Types, model } from "mongoose";

const productSchema = new Schema({
    name: { type: String, required: true, trim: true, lowerCase: true },
    slug: { type: String, required: true, trim: true, lowerCase: true },
    stock: { type: Number, default: 1, required: true },
    price: { type: Number, default: 1, required: true },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 1 },
    customId: String,
    description: String,
    type: String,
    colors: [String],
    size: { type: [String], enum: ['s', 'm', 'lg', 'lx'] },

    mainImage: { type: Object, required: true },
    subImages: { type: [Object] },

    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    subcategoryId: { type: Types.ObjectId, ref: "Subcategory", required: true },
    brandId: { type: Types.ObjectId, ref: "Brand", required: true },

    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    wishUserList: [{ type: Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


productSchema.virtual('review', {
    ref: "Review",
    localField: "_id",
    foreignField: "productId"
})

const productModel = mongoose.models.Product || model('Product', productSchema);
export default productModel;