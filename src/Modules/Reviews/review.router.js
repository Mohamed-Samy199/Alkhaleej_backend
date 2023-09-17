import { Router } from "express";
import { createReview, updateReview } from "./review.controller.js";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./review.endPoint.js";

const reviewRouter = Router({ mergeParams: true });

reviewRouter.post("/", auth(endPoint.user), asyncHandle(createReview));
reviewRouter.put("/:reviewId", auth(endPoint.user), asyncHandle(updateReview));


export default reviewRouter;