import { Router } from "express";
import { authModule, confirmEmail, forgetPassword, getWishlist, login, requistNewConfirmEmail, sendCode, signOut, signUp } from "./auth.controller.js";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { endPoint } from "./auth.endPoint.js";
import { auth } from "../../Middelware/authuntication.js";
import { validation } from "../../Middelware/validation.js";
import { signinValidation, signupValidation, tokenValidation } from "./auth.validation.js";


const authRouter = Router();

authRouter.get('/', authModule);
authRouter.post('/signup', validation(signupValidation), asyncHandle(signUp));
authRouter.get('/confirmationEmail/:token', validation(tokenValidation), asyncHandle(confirmEmail));
authRouter.get('/refrash/:token', validation(tokenValidation), asyncHandle(requistNewConfirmEmail));
authRouter.post('/login', validation(signinValidation), asyncHandle(login));

authRouter.patch('/sendCode', asyncHandle(sendCode));
authRouter.post('/resetPassword', asyncHandle(forgetPassword))

authRouter.patch('/logout', asyncHandle(signOut))

authRouter.get("/wishlist", auth(endPoint.user), asyncHandle(getWishlist));


export default authRouter;