import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./order.endPoint.js";
import { cancelOrder, createOrder, createOrderCard, getAllOrders, getAllPayments, updateOrderStatusByAdmin } from "./order.controller.js";

const orderRouter = Router();

orderRouter.get("/", auth(endPoint.admin), asyncHandle(getAllPayments));
orderRouter.get("/user", auth(endPoint.user), asyncHandle(getAllOrders));
orderRouter.post("/", auth(endPoint.user), asyncHandle(createOrder));
orderRouter.post("/card", auth(endPoint.user), asyncHandle(createOrderCard));
orderRouter.patch("/:orderId", auth(endPoint.user), asyncHandle(cancelOrder));
orderRouter.patch("/:orderId/admin", auth(endPoint.admin), asyncHandle(updateOrderStatusByAdmin));


export default orderRouter;