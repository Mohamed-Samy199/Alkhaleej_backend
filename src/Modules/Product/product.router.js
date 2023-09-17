import { Router } from "express"
import { myMulter } from "../../Utils/multer.js";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { addToWishlist, createProduct, getProduct, getProductDetails, getWishlist, removeFromWishlist, updateProduct } from "./product.controller.js";
import { auth, roles } from "../../Middelware/authuntication.js";
import { endPoint } from "./product.endPoint.js";
import reviewRouter from "../Reviews/review.router.js";

const productRouter = Router();

productRouter.use("/review", reviewRouter);

productRouter.get("/", asyncHandle(getProduct))
productRouter.get("/:_id", asyncHandle(getProductDetails))



productRouter.post("/",
    auth(endPoint.admin),
    myMulter({}).fields([
        { name: "mainImage", maxCount: 1 },
        { name: "subImages", maxCount: 5 }
    ]), asyncHandle(createProduct));

productRouter.put("/:productId",
    auth(endPoint.admin),
    myMulter({}).fields([
        { name: "mainImage", maxCount: 1 },
        { name: "subImages", maxCount: 5 }
    ]), asyncHandle(updateProduct));

productRouter.get("/wishlist/wishlist", auth(endPoint.user), asyncHandle(getWishlist));

productRouter.post("/wishlist", auth(endPoint.user), asyncHandle(addToWishlist));
productRouter.patch("/wishlist/remove", auth(endPoint.user), asyncHandle(removeFromWishlist));

export default productRouter;