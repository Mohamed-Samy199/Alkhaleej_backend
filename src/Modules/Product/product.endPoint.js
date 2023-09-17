import { roles } from "../../Middelware/authuntication.js";

export const endPoint = {
    admin: [roles.Admin],
    user: [roles.User]
}