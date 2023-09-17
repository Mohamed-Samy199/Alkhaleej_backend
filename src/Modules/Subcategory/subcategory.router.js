import { Router } from "express";
import { createSubcategory, getSubCategory, updateSubcategory } from "./subcategory.controller.js";
import { myMulter } from "../../Utils/multer.js";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { endPoint } from "./subcategory.endPoint.js";
import { auth } from "../../Middelware/authuntication.js";

const subcategoryRouter = Router({ mergeParams: true, caseSensitive: true });

subcategoryRouter.get("/", getSubCategory);

subcategoryRouter.post("/", auth(endPoint.admin), myMulter({}).single("image"), asyncHandle(createSubcategory));
subcategoryRouter.put("/:subcategoryId", auth(endPoint.admin), myMulter({}).single("image"), asyncHandle(updateSubcategory));

export default subcategoryRouter;