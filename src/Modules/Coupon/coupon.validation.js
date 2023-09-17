import Joi from "joi";

export const validationCoupon = Joi.object({
    name: Joi.string().min(3).max(35).required(),

    // amount : Joi.number().positive().min(1).max(100).required(),
    expireDate: Joi.number().positive().min(1).max(100)
}).required()