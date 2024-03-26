import mongoose, { Schema, Types, model } from "mongoose";

const reviewSchema = new Schema({
    comment: { type: String, required: true },
    rate: { type: Number, min: 0, max: 5 },
    createBy: { type: Types.ObjectId, ref: "User", required: true },
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    // orderId: { type: Types.ObjectId, ref: "Order", required: true },
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

reviewSchema.virtual('user', {
    ref: "User",
    localField: 'createBy',
    foreignField: '_id'
});


const reviewModel = mongoose.models.Review || model('Review', reviewSchema);
export default reviewModel;