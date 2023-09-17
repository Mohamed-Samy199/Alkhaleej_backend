import Joi from "joi";
import { generalFields } from "../../Middelware/validation.js";

export const validationCategory = Joi.object({
    name: Joi.string().min(3).max(35).required(),
    file: Joi.required()
}).required()

export const signupValidation = Joi.object({
    userName: Joi.string().min(3).max(30).required(),
    email: generalFields.email,
    password: generalFields.password,
    cpassword: generalFields.cpassword
}).required()

export const signinValidation = Joi.object({
    email: generalFields.email,
    password: generalFields.password
}).required()

export const tokenValidation = Joi.object({
    token: Joi.string().required()
}).required()