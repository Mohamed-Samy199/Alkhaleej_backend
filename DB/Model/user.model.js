import mongoose, { Schema, Types, model } from "mongoose";

const userSchema = new Schema({
    userName: {
        type: String,
        required: [true, 'user name is required'],
        min: [2, 'minmum length 2 char'],
        max: [20, 'maxmum length 2 char'],
        lowercase: true
    },
    email: {
        type: String,
        required: [true, 'user email is required'],
        unique: [true, 'email must be unique value'],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'user password is required'],
    },
    provider : {
        type : String,
        default: "system",
        enum : ['system', 'facebook', 'GOOGLE']
    },
    image: Object,
    changePasswordTime: Date,
    role: {
        type: String,
        default: "User",
        enum: ["User", "Admin"]
    },
    wishlist: {
        type: [{ type: Types.ObjectId, ref: "Product" }],
    },
    numOfCartItems: { type: Number },
    status: {
        type: String,
        default: "offline",
        enum: ["online", "offline", "blocked"]
    },
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
userSchema.virtual('order', {
    ref: "Order",
    localField: "_id",
    foreignField: "userId"
});

const userModel = mongoose.models.User || model('User', userSchema);

export default userModel;