import userModel from "../../DB/Model/user.model.js";
import { asyncHandle } from "../Utils/errorHandle.js";
import { veryfiyToken } from "../Utils/generate&verfiyToken.js";

export const roles = {
    Admin: "Admin",
    User: "User",
    HR: "HRs"
}
export const auth = (accessRoles = []) => {
    return asyncHandle(async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization?.startsWith(process.env.BEARER_KEY)) {
            return next(new Error("In-valid bearer key", { cause: 400 }));
        }
        const token = authorization.split(process.env.BEARER_KEY)[1];
        if (!token) {
            return next(new Error("In-valid token", { cause: 400 }));
        }
        const decoded = veryfiyToken({ token });
        if (!decoded?.id) {
            return next(new Error("In-valid token payload", { cause: 400 }));
        }
        const user = await userModel.findById(decoded.id).select("userName role changePasswordTime email");
        if (!user) {
            return next(new Error("Not register user", { cause: 401 }));
        }
        // log out from all device when change and update password...
        // console.log({changePasswordTime : parseInt(user.changePasswordTime?.getTime() / 1000) , iat : decoded.iat});
        if (parseInt(user.changePasswordTime?.getTime() / 1000) > decoded.iat) {
            return next(new Error("Expire Token", { cause: 400 }));
        }
        if (!accessRoles.includes(user.role)) {
            return next(new Error("Not authorized user", { cause: 403 }));
        }
        req.user = user;
        return next();
    })
}