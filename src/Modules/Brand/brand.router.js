import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { createBrand, getBrand, getSameBrand, updateBrand } from "./brand.controller.js";
import { myMulter } from "../../Utils/multer.js";
import { auth, roles } from "../../Middelware/authuntication.js";
import { endPoint } from "./brand.endPoint.js";

const brandRouter = Router();

// auth(Object.values(roles))
brandRouter.get("/", asyncHandle(getBrand));
brandRouter.get("/:_id", asyncHandle(getSameBrand));

brandRouter.post("/", auth(endPoint.admin), myMulter({}).single("image"), asyncHandle(createBrand));
brandRouter.put("/:brandId", auth(endPoint.admin), myMulter({}).single("image"), asyncHandle(updateBrand));

export default brandRouter;