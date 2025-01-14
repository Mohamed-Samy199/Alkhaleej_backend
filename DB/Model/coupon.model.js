import mongoose, { Schema, Types, model } from "mongoose";

const couponSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true, lowerCase: true },
    image: { type: Object },
    amount: { type: Number, default: 1 },
    expireDate: { type: Date, required: true },
    usedBy: [{ type: Types.ObjectId, ref: "User" }],
    createBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    url: String,
    translations: {
        en: { type: String, trim: true },
        ar: { type: String, trim: true },
        // Add more languages if needed
    },
}, {
    timestamps: true,
});

const couponModel = mongoose.models.Coupon || model('Coupon', couponSchema);
export default couponModel;