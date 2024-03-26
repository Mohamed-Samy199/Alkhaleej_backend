import multer from "multer"

export const validationObject = {
    image: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/avif", "image/svg", "video/mp4"],
    file: ["application/pdf", "application/msword"],
    video: ["video/mp4"]
}
export const myMulter = ({ custonValidation = validationObject.image } = {}) => {
    const storage = multer.diskStorage({})
    const fileFilter = (req, file, cb) => {
        if (!custonValidation.includes(file.mimetype)) {
            return cb(new Error("In-valid type extantion", { cause: 400 }), false)
        }
        cb(null, true)
    }
    const upload = multer({ fileFilter, storage });
    return upload;
}