import { Router } from "express";
import { createCoupon, getCoupon, updateCoupon } from "./coupon.controller.js";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { myMulter } from "../../Utils/multer.js";
import { validation } from "../../Middelware/validation.js";
import { validationCoupon } from "./coupon.validation.js";
import { endPoint } from "./coupon.endPoint.js";
import { auth } from "../../Middelware/authuntication.js";

const couponRouter = Router();

couponRouter.get("/", asyncHandle(getCoupon));
couponRouter.post("/", auth(endPoint.admin), myMulter({}).single("image"), asyncHandle(createCoupon));
couponRouter.put("/:couponId", auth(endPoint.admin), myMulter({}).single("image"), asyncHandle(updateCoupon));



export default couponRouter;