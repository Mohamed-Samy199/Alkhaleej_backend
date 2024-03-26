import { Router } from "express";
import { authModule, createAdmin, getWishlist, login, loginWithGmail, signUp, updateAdminToUser } from "./auth.controller.js";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { endPoint } from "./auth.endPoint.js";
import { auth } from "../../Middelware/authuntication.js";
import { validation } from "../../Middelware/validation.js";
import { signinValidation, signupValidation } from "./auth.validation.js";


const authRouter = Router();

authRouter.get('/', authModule);
authRouter.post("/loginWithGmail", asyncHandle(loginWithGmail));
authRouter.post('/signup', validation(signupValidation), asyncHandle(signUp));
authRouter.post('/login', validation(signinValidation), asyncHandle(login));
authRouter.post("/newAdmin", auth(endPoint.admin), asyncHandle(createAdmin));
authRouter.post("/remove-admin" , auth(endPoint.admin) , asyncHandle(updateAdminToUser));

authRouter.get("/wishlist", auth(endPoint.user), asyncHandle(getWishlist));


export default authRouter;