import orderModel from "../../../DB/Model/order.model.js";
import reviewModel from "../../../DB/Model/review.model.js";

export const createReview = async (req, res, next) => {
    const { comment, rate, productId } = req.body;
    if (!comment || !rate || !productId) {
        return next(new Error("Missing required fields in the request body.", { cause: 400 }));
    }
    const order = await orderModel.findOne({ userId: req.user._id, $or: [{ status: "delivered" }, { status: "waitPayment" }, { status: "placed" }], "products.productId": productId });
    if (!order) {
        return next(new Error("can not review product before receive it", { cause: 400 }));
    }
    if (await reviewModel.findOne({ createBy: req.user._id, productId, orderId: order._id })) {
        return next(new Error("Already review by you", { cause: 400 }));
    }
    const review = await reviewModel.create({ comment, rate, productId, createBy: req.user._id, orderId: order._id });
    return res.status(201).json({ message: "Done", review })
}
export const updateReview = async (req, res, next) => {
    const { productId, reviewId } = req.params;
    const review = await reviewModel.updateOne({ productId, _id: reviewId }, req.body);
    return res.status(200).json({ message: "Done", review })
}