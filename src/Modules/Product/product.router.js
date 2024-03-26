import { Router } from "express"
import { myMulter } from "../../Utils/multer.js";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { addToWishlist, createProduct, deleteProduct, getProduct, getProductDetails, getWishlist, removeFromWishlist } from "./product.controller.js";
import { auth, roles } from "../../Middelware/authuntication.js";
import { endPoint } from "./product.endPoint.js";
import reviewRouter from "../Reviews/review.router.js";

const productRouter = Router();

productRouter.use("/review", reviewRouter);

productRouter.get("/", asyncHandle(getProduct))
productRouter.get("/:_id/:name", asyncHandle(getProductDetails))
productRouter.post("/",
    auth(endPoint.admin),
    myMulter({}).fields([
        { name: "mainImage", maxCount: 1 },
        { name: "subImages", maxCount: 5 }
    ]), asyncHandle(createProduct));
productRouter.delete("/:productId", auth(endPoint.admin), asyncHandle(deleteProduct));

productRouter.get("/wishlist/wishlist/wishlist", auth(endPoint.user), asyncHandle(getWishlist));

productRouter.post("/wishlist", auth(endPoint.user), asyncHandle(addToWishlist));
productRouter.patch("/wishlist/remove", auth(endPoint.user), asyncHandle(removeFromWishlist));

export default productRouter;