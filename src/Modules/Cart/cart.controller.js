import cartModel from "../../../DB/Model/cart.model.js";
import productModel from "../../../DB/Model/product.model.js";

export const getCartProducts = async (req, res, next) => {
    const cart = await cartModel.findOne({ userId: req.user._id }).populate("products.productId");
    // const cart = await cartModel.find({})
    if (!cart) {
        return next(new Error("not there cart", { cause: 404 }))
    }
    let numOfCartItems = cart.products.length
    return res.status(200).json({ message: "Done", cart, numOfCartItems })
}
export const createCart = async (req, res, next) => {
    const { productId, quntity } = req.body;
    // check product availabilty
    const product = await productModel.findById(productId);
    if (!product) {
        return next(new Error("In-valid product id", { cause: 400 }));
    }
    if (product.stock < quntity || product.isDeleted) {
        await productModel.updateOne({ _id: productId }, { $addToSet: { wishUserList: req.user._id } });
        return next(new Error(`In-valid product quntity max available is ${product.stock}`, { cause: 400 }));
    }
    // check cart exist
    const cart = await cartModel.findOne({ userId: req.user._id });
    // if not exsit cart cart one

    if (!cart) {
        const newCart = await cartModel.create({ userId: req.user._id, products: [{ productId, quntity }] });
        return res.status(201).json({ message: "Done", cart: newCart });
    }
    // if exist their 2 option 
    // 1=> update 
    let matchProduct = false
    for (let i = 0; i < cart.products.length; i++) {
        if (cart.products[i].productId.toString() == productId) {
            cart.products[i].quntity = quntity;
            matchProduct = true;
            break;
        }
    }
    // 2=> push new item
    if (!matchProduct) {
        cart.products.push(({ productId, quntity }))
    }

    await cart.save()
    return res.status(200).json({ message: "Done", cart });
}
export async function deleteItemFromCart(productId, userId) {
    const cart = await cartModel.updateOne({ userId }, {
        $pull: {
            products: {
                productId: { $in: productId }
            }
        }
    })
    return cart;
}
export const deleteItem = async (req, res, next) => {
    const { productId } = req.body;
    if (!productId) {
        return next(new Error("In-valid product id"))
    }
    const cart = await deleteItemFromCart(productId, req.user._id);
    return res.status(200).json({ message: "Done", cart })
}
export async function emptyCart(userId) {
    const cart = await cartModel.updateOne({ userId }, { products: [] })
    return cart;
}
export const clearCart = async (req, res, next) => {
    const { userId } = req.body
    // const cart = await emptyCart(req.user._id);
    const cart = await emptyCart(userId);
    return res.status(200).json({ message: "Done", cart })
}