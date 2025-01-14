import jwt from "jsonwebtoken";

export const generateToken = ({ payload, signature = process.env.TOKEN_SIGNATURE, expiresIn = 60 * 60 * 24 * 365 } = {}) => {
    const token = jwt.sign(payload, signature, { expiresIn: +expiresIn });
    return token;
}
export const veryfiyToken = ({ token, signature = process.env.TOKEN_SIGNATURE } = {}) => {
    const decoded = jwt.verify(token, signature);
    return decoded;
}