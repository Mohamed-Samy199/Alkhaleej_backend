import reviewModel from "../../../DB/Model/review.model.js";

export const getAllReviews = async (req, res, next) => {
    const { productId } = req.params;
    const review = await reviewModel.find({ productId }).populate([
        {
            path: "user",
            select: "_id userName"
        }
    ]).sort({ createdAt: -1 });

    return res.status(200).json({ message: "Done", review })
};
export const createReview = async (req, res, next) => {
    const { comment, rate, productId } = req.body;
    if (!comment || !rate || !productId) {
        return next(new Error("Missing required fields in the request body.", { cause: 400 }));
    }
    if (await reviewModel.findOne({ createBy: req.user._id, productId })) {
        return next(new Error("Already review by you", { cause: 400 }));
    }
    const review = await reviewModel.create({ comment, rate, productId, createBy: req.user._id });
    return res.status(201).json({ message: "Done", review })
};
export const deleteReview = async (req, res, next) => {
    const { productId, reviewId } = req.params;
    if (req.user.role === "Admin") {
        const review = await reviewModel.findOneAndDelete({_id : reviewId , productId} , {new : true});
        if (!review) {
            return next(new Error(`not thier review`), { cause: 404 })
        }
        else {
            return res.status(200).json({ message: "Deleted Successfully" })
        }
    } else {
        const review = await reviewModel.findOneAndDelete({ _id: reviewId, productId, createBy: req.user._id }, { new: true });
        if (!review) {
            return next(new Error(`This is not your review`), { cause: 404 })
        }
        else {
            return res.status(200).json({ message: "Deleted Successfully" })
        }
    }
};