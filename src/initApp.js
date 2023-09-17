import morgan from "morgan";
import DBConnect from "../DB/connection.js";
import authRouter from "./Modules/Auth/auth.router.js";
import brandRouter from "./Modules/Brand/brand.router.js";
import cartRouter from "./Modules/Cart/cart.router.js";
import categoryRouter from "./Modules/Category/category.router.js";
import couponRouter from "./Modules/Coupon/coupon.router.js";
import productRouter from "./Modules/Product/product.router.js";
import subcategoryRouter from "./Modules/Subcategory/subcategory.router.js";
import { globalErrorHandle } from "./Utils/errorHandle.js";
import orderRouter from "./Modules/Order/order.router.js";
import reviewRouter from "./Modules/Reviews/review.router.js";
import cors from "cors"
import chalk from "chalk";

const initApp = (app, express) => {
    app.use(express.json())
    app.use(cors({}));
    app.use((req, res, next) => {
        console.log(chalk.red(req.header('origin')));
        next()
    })

    if (process.env.MOOD == "DEV") {
        app.use(morgan("dev"))
    } else {
        app.use(morgan("combined"))
    }

    app.get("/", (req, res) => console.log(res.send("Hello World")))

    app.use("/auth", authRouter);
    app.use("/category", categoryRouter);
    app.use("/subcategory", subcategoryRouter);
    app.use("/coupon", couponRouter);
    app.use("/brand", brandRouter);
    app.use("/product", productRouter);
    app.use("/cart", cartRouter);
    app.use("/order", orderRouter);
    app.use("/review", reviewRouter)

    app.all("*", (req, res, next) => {
        return res.json({ message: "In-valid Router - can not access this endPoint " + req.originalUrl });
    })

    app.use(globalErrorHandle)
    DBConnect();
}

export default initApp;