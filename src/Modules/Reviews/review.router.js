import { Router } from "express";
import { createReview, deleteReview, getAllReviews } from "./review.controller.js";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { auth, roles } from "../../Middelware/authuntication.js";
import { endPoint } from "./review.endPoint.js";

const reviewRouter = Router({ mergeParams: true });

reviewRouter.get("/:productId", asyncHandle(getAllReviews));
reviewRouter.post("/", auth(endPoint.user), asyncHandle(createReview));
reviewRouter.delete("/:productId/:reviewId", auth(Object.values(roles)), asyncHandle(deleteReview));


export default reviewRouter;