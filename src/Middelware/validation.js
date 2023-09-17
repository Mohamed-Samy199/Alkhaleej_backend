import joi from 'joi'

export const generalFields = {
    email: joi.string().email().required(),
    password: joi.string().required(),
    cpassword: joi.string().required(),
    id: joi.string().min(24).max(24).required()
}

export const validation = (schema) => {
    return (req, res, next) => {
        const inputData = { ...req.body, ...req.params, ...req.query };
        if (req.file || req.files) {
            inputData.file = req.file || req.files
        }
        const validationResult = schema.validate(inputData, { abortEarly: false });
        if (validationResult.error?.details) {
            return res.status(400).json({ message: "validation error", validationErr: validationResult.error.details });
        }
        next();
    }
}