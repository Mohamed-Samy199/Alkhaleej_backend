import mongoose, { Schema, Types, model } from "mongoose";

const cartSchema = new Schema({
    userId: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    products: [{
        productId: { type: Types.ObjectId, ref: "Product", required: true },
        quntity: { type: Number, default: 1, required: true },
    }],
    numOfCartItems: { type: Number },
    totalCartPrice: { type: Number }
}, {
    timestamps: true,
});

const cartModel = mongoose.models.Cart || model('Cart', cartSchema);
export default cartModel;