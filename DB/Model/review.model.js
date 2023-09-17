import mongoose, { Schema, Types, model } from "mongoose";

const reviewSchema = new Schema({
    comment: { type: String, required: true },
    rate: { type: Number, min: 0, max: 5 },
    createBy: { type: Types.ObjectId, ref: "User", required: true },
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    orderId: { type: Types.ObjectId, ref: "Order", required: true }
}, {
    timestamps: true,
});


const reviewModel = mongoose.models.Review || model('Review', reviewSchema);
export default reviewModel;