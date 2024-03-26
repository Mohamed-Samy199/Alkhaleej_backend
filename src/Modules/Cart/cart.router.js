import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { clearCart, createCart, deleteItem, getCartProducts, updateCartQuantity } from "./cart.controller.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./cart.endPoint.js";

const cartRouter = Router();

cartRouter.get("/", auth(endPoint.user), asyncHandle(getCartProducts));
cartRouter.post("/", auth(endPoint.user), asyncHandle(createCart));
cartRouter.patch("/remove", auth(endPoint.user), asyncHandle(deleteItem));
cartRouter.patch("/clear", auth(endPoint.user), asyncHandle(clearCart));
cartRouter.patch('/update/:productId/:action' , auth(endPoint.user) , asyncHandle(updateCartQuantity));

export default cartRouter;

// # DB_LOCAL = mongodb+srv://AlkhaleejOnline:01099558675@cluster0.roycpmp.mongodb.net/AlkhaleejOnline
