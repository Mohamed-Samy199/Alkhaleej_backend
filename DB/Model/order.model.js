import mongoose, { Schema, Types, model } from "mongoose";

const orderSchema = new Schema({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    address: { type: String, required: true },
    phone: [{ type: String, required: true }],
    note: String,
    city: String,
    count: Number,
    reason: String,
    products: [{
        name: { type: String, required: true },
        mainImage: { type: Object },
        productId: { type: Types.ObjectId, ref: "Product", required: true },
        quntity: { type: Number, default: 1, required: true },
        unitPrice: { type: Number, default: 1, required: true },
        finalPrice: { type: Number, default: 1, required: true }
    }],
    couponId: { type: Types.ObjectId, ref: "Coupon" },
    suptotal: { type: Number, default: 1, required: true },
    finalPrice: { type: Number, default: 1, required: true },
    paymentType: { type: String, default: 'cash', enum: ['cash', 'card'] },
    status: { type: String, default: 'placed', enum: ['waitPayment', 'placed', 'canceled', 'rejected', 'onWay', 'delivered'] },
    translations: {
        en: { type: String, trim: true },
        ar: { type: String, trim: true },
        // Add more languages if needed
    },
}, {
    timestamps: true,
});

const orderModel = mongoose.models.Order || model('Order', orderSchema);
export default orderModel;