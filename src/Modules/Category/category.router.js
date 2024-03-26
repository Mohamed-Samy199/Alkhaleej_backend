import { Router } from "express";
import { myMulter, validationObject } from "../../Utils/multer.js";
import { createCategorey, deleteCategory, getCategory } from "./category.controller.js";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { validationCategory } from "../Auth/auth.validation.js";
import { validation } from "../../Middelware/validation.js";
import subcategoryRouter from "../Subcategory/subcategory.router.js";
import { auth, roles } from "../../Middelware/authuntication.js";
import { endPoint } from "./category.endPoint.js";

const categoryRouter = Router();

categoryRouter.use("/:categoryId/subcategory", subcategoryRouter)

categoryRouter.get("/", asyncHandle(getCategory));

categoryRouter.post("/", auth(endPoint.admin), myMulter({}).single("image"), asyncHandle(createCategorey));
categoryRouter.delete("/:categoryId", auth(endPoint.admin), asyncHandle(deleteCategory));

export default categoryRouter;