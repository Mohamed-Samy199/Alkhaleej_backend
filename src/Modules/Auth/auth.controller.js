import { customAlphabet, nanoid } from "nanoid";
import userModel from "../../../DB/Model/user.model.js";
import { generateToken, veryfiyToken } from "../../Utils/generate&verfiyToken.js";
import { compary, hash } from "../../Utils/hash&compary.js";
import { OAuth2Client } from 'google-auth-library';


export const authModule = async (req, res, next) => {
    const users = await userModel.find({});
    return res.json({ message: "Auth Module", users });
}
export const signUp = async (req, res, next) => {
    const { userName, email, password } = req.body;
    if (await userModel.findOne({ email: email.toLowerCase() })) {
        return next(new Error("user already exist", { cause: 409 }))
    }
    // hashPassword
    const hashPassword = hash({ plaintext: password })
    // create user
    const user = await userModel.create({ userName, email, password: hashPassword })
    return res.status(201).json({ message: "Done", user: user._id })
}
export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
        return next(new Error("User not Register"), { cause: 404 });
    }
    if (!compary({ plaintext: password, hashValue: user.password })) {
        return next(new Error("In-valid login data."), { cause: 409 });
    }
    if ((email.toString() === "alkaaleej@yahoo.com") || (email.toString() ===  "mooh246samy@gmail.com")) {
        user.role = "Admin";
    }
    const access_token = generateToken({ payload: { id: user._id, role: user.role, userName: user.userName } });
    const refrash_token = generateToken({ payload: { id: user._id, role: user.role, userName: user.userName } });
    user.status = "online";
    await user.save();
    return res.status(200).json({ message: "Done", access_token, refrash_token });
}
export const createAdmin = async (req, res, next) => {
    const { email } = req.body;
    if (!await userModel.findOne({ email })) {
        return next(new Error("user not found", { cause: 404 }));
    }
    const admin = await userModel.findOneAndUpdate({ email }, { role: "Admin" }, { new: true });
    if (!admin) {
        return next(new Error("user not found or update", { cause: 409 }));
    }
    return res.status(201).json({ message: "Done", newAdmin: admin.role });
}
export const updateAdminToUser = async (req, res, next) => {
    const { email } = req.body;
    if (!await userModel.findOne({ email })) {
        return next(new Error("user not found", { cause: 404 }));
    }
    const user = await userModel.findOneAndUpdate({ email, role: "Admin" }, { role: "User" }, { new: true });
    if (!user) {
        return next(new Error("user not found or update", { cause: 409 }));
    }
    return res.status(201).json({ message: "Done", user: user.role });
}
export const loginWithGmail = async (req, res, next) => {
    const { credential } = req.body;
    const client = new OAuth2Client(process.env.CLIENT_ID);
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.CLIENT_ID
        });
        const payload = ticket.getPayload();
        return payload;
    }
    const { email, email_verified, picture, name } = await verify();
    if (!email_verified) {
        return next(new Error("In-valid email", { cause: 400 }));
    }
    const user = await userModel.findOne({ email });
    if (user) {
        // login
        if (user.provider != "GOOGLE") {
            return next(new Error(`In-valid provider true provider is ${user.provider}`, { cause: 400 }))
        }
        if (email.toString() === "alkaaleej@yahoo.com") {
            user.role = "Admin";
        }
        const access_token = generateToken({ payload: { id: user._id, role: user.role, userName: user.userName , email: user.email } });
        const refrash_token = generateToken({ payload: { id: user._id, role: user.role, userName: user.userName, email: user.email } });
        user.status = "online";
        await user.save();
        return res.status(200).json({ message: "Done login", access_token, refrash_token })
    }
    // signup
    // hashPassword
    const customPassword = customAlphabet('123456789zxcvbnmasdfghjklqwertyuiop', 9)
    const hashPassword = hash({ plaintext: customPassword() })
    // create user
    const { _id, role } = await userModel.create({
        userName: name,
        email,
        password: hashPassword,
        image: { secure_url: picture },
        status: 'online',
        provider: 'GOOGLE',
        role: email.toString() === "alkaaleej@yahoo.com"  ? 'Admin' : 'User'
    });
    const access_token = generateToken({ payload: { id: _id, role, userName: name , email} });
    const refrash_token = generateToken({ payload: { id: _id, role, userName: name , email} });

    return res.status(201).json({ message: "Done", access_token, refrash_token });
}

export const getWishlist = async (req, res, next) => {
    const wishlist = await userModel.find({}).select("wishlist")
    return res.status(200).json({ message: "Done", wishlist })
}
