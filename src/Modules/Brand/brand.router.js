import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { createBrand, deleteBrand, getBrand, getSameBrand } from "./brand.controller.js";
import { myMulter } from "../../Utils/multer.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./brand.endPoint.js";

const brandRouter = Router();

brandRouter.get("/", asyncHandle(getBrand));
brandRouter.get("/:_id", asyncHandle(getSameBrand));

brandRouter.post("/", auth(endPoint.admin), myMulter({}).single("image"), asyncHandle(createBrand));
brandRouter.delete("/:brandId", auth(endPoint.admin), asyncHandle(deleteBrand));

export default brandRouter;