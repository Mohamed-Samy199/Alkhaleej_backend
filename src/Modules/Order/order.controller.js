import Stripe from "stripe";
import cartModel from "../../../DB/Model/cart.model.js";
import orderModel from "../../../DB/Model/order.model.js";
import productModel from "../../../DB/Model/product.model.js";
import payment from "../../Utils/payment.js";
import { createInvoice } from "../../Utils/pdf.js";
import { sendEmail } from "../../Utils/sendEmail.js";
import { emptyCart } from "../Cart/cart.controller.js";
import userModel from "../../../DB/Model/user.model.js";
import couponModel from "../../../DB/Model/coupon.model.js";

export const getAllPayments = async (req , res , next) => {
    const payments = await orderModel.find({}).sort({createdAt : -1})
    .populate("userId", "userName email");
    if (!payments) {
        return next(new Error("not their payments yet", {couse : 400}))
    }
    return res.status(200).json({ message: "Done", payments })
}
export const getAllOrders = async (req, res, next) => {
    const order = await userModel.findOne({ _id: req.user._id }).populate([{
        path: "order"
    }]).select("order")
    if (!order) {
        return next(new Error("not found order", { cause: 400 }))
    }
    return res.status(200).json({ message: "Done", order })
}
export const createOrder = async (req, res, next) => {
    const { address, phone, city, couponName, paymentType, note } = req.body;

    if (!req.body.products) {
        const cart = await cartModel.findOne({ userId: req.user._id });
        if (!cart?.products?.length) {
            return next(new Error("cart empty", { cause: 400 }));
        }
        req.body.isCart = true;
        req.body.products = cart.products
    }
    if (couponName) {
        const coupon = await couponModel.findOne({ name: couponName.toLowerCase(), usedBy: { $nin: req.user._id } });
        if (!coupon || coupon.expireDate?.getTime() < Date.now()) {
            return next(new Error("In-valid or expire coupon", { cause: 400 }));
        }
        req.body.coupon = coupon;
    }
    const productIds = [];
    const finalProductList = [];
    let suptotal = 0;
    for (let product of req.body.products) {
        const checkProduct = await productModel.findOne({
            _id: product.productId,
            stock: { $gte: product.quntity },
            isDeleted: false
        })
        if (!checkProduct) {
            return next(new Error(`In-valid product with id ${product.productId}`, { cause: 400 }))
        }
        if (req.body.isCart) {
            product = product.toObject()
        }
        productIds.push(product.productId);


        product.name = checkProduct.name;
        product.mainImage = checkProduct.mainImage;
        product.unitPrice = checkProduct.finalPrice;
        product.finalPrice = product.quntity * checkProduct.finalPrice.toFixed(2);

        finalProductList.push(product);
        suptotal += product.finalPrice;
    }
    let count = finalProductList.length;
    const order = await orderModel.create({
        userId: req.user._id,
        address,
        city,
        phone,
        count,
        note,
        products: finalProductList,
        couponId: req.body.coupon?._id,
        suptotal,
        finalPrice: suptotal - (suptotal * ((req.body.coupon?.amount || 0) / 100)).toFixed(2),
        paymentType,
        status: paymentType == "card" ? "waitPayment" : "placed"
    })
    // decrease product from stock
    for (const product of req.body.products) {
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: -parseInt(product.quntity) } })
    }
    // push user id in coupon userBy
    if (req.body.coupon) {
        await couponModel.updateOne({ _id: req.body.coupon._id }, { $addToSet: { usedBy: req.user._id } })
    }
    if (req.body.isCart) {
        await emptyCart(req.user._id)
        // await cartModel.updateOne({ userId: req.user._id }, { products: [] })
    } else {
        await deleteItemFromCart(productIds, req.user._id)
    }

    if (order.paymentType == 'card') {
        const stripe = new Stripe(process.env.STRIPE_KEY);
        if (req.body.coupon) {
            const coupon = await stripe.coupons.create({ percent_off: req.body.coupon.amount, duration: 'once' });
            req.body.couponId = coupon.id
        }
        const session = await payment({
            stripe,
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: req.user.email,
            metadata: {
                orderId: order._id.toString()
            },
            cancel_url: `${process.env.CANCEL_URL}?orderId=${order._id.toString()}`,
            line_items: order.products.map(product => {
                return {
                    price_data: {
                        currency: 'egp',
                        product_data: {
                            name: product.name,
                            mainImage: [product.mainImage]
                        },
                        unit_amount: product.unitPrice * 100
                    },
                    quantity: product.quntity
                }
            }),
            discounts: req.body.couponId ? [{ coupon: req.body.couponId }] : []
        })
        return res.status(201).json({ message: "Done", order, url: session.url });
    }
    // generate pdf 
    const invoice = {
        shipping: {
            name: req.user.userName,
            address: order.address,
            city: "Cairo",
            state: "Cairo",
            country: "Egypt",
            postal_code: 94111
        },
        items: order.products,
        subtotal: suptotal,
        total: order.finalPrice,
        invoice_nr: order._id,
        date: order.createdAt
    };
    await createInvoice(invoice, "invoice.pdf");

    const emailSend = await sendEmail({
        to: req.user.email,
        message: "Please check your invoice pdf",
        subject: "Invoice",
        attachments: [
            {
                filename: "invoice.pdf",
                path: "./invoice.pdf",
                contentType: "application/pdf",
            },
        ],
    });

    if (!emailSend) {
        return res.json({ message: 'Email Rejected' })
    }

    return res.status(201).json({ message: "Done", order });
}

export const createOrderCard = async (req, res, next) => {
    const { address, phone, city, couponName, paymentType, note } = req.body;

    if (!req.body.products) {
        const cart = await cartModel.findOne({ userId: req.user._id });
        if (!cart?.products?.length) {
            return next(new Error("cart empty", { cause: 400 }));
        }
        req.body.isCart = true;
        req.body.products = cart.products;
    }

    if (couponName) {
        const coupon = await couponModel.findOne({ name: couponName.toLowerCase(), usedBy: { $nin: req.user._id } });
        if (!coupon || coupon.expireDate?.getTime() < Date.now()) {
            return next(new Error("In-valid or expired coupon", { cause: 400 }));
        }
        req.body.coupon = coupon;
    }

    const productIds = [];
    const finalProductList = [];
    let subtotal = 0;

    for (let product of req.body.products) {
        const checkProduct = await productModel.findOne({
            _id: product.productId,
            stock: { $gte: product.quntity },
            isDeleted: false,
        });

        if (!checkProduct) {
            return next(new Error(`Invalid product with id ${product.productId}`, { cause: 400 }));
        }

        if (req.body.isCart) {
            product = product.toObject();
        }

        productIds.push(product.productId);
        product.name = checkProduct.name;
        product.mainImage = checkProduct.mainImage;
        product.unitPrice = checkProduct.finalPrice;
        product.finalPrice = (product.quntity * checkProduct.finalPrice).toFixed(2);

        finalProductList.push(product);
        subtotal += parseFloat(product.finalPrice);
    }

    let count = finalProductList.length;

    let order = await orderModel.create({
        userId: req.user._id,
        address,
        city,
        phone,
        note,
        count,
        products: finalProductList,
        couponId: req.body.coupon?._id,
        subtotal,
        finalPrice: (subtotal - (subtotal * ((req.body.coupon?.amount || 0) / 100))).toFixed(2),
        paymentType,
        status: paymentType === "card" ? "waitPayment" : "placed",
    });

    // Decrease product stock
    for (const product of req.body.products) {
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: -parseInt(product.quntity) } });
    }

    // Push user id in coupon usedBy
    if (req.body.coupon) {
        await couponModel.updateOne({ _id: req.body.coupon._id }, { $addToSet: { usedBy: req.user._id } });
    }

    if (req.body.isCart) {
        await emptyCart(req.user._id);
    } else {
        await deleteItemFromCart(productIds, req.user._id);
    }

    if (order.paymentType === 'card') {
        const stripe = new Stripe(process.env.STRIPE_KEY);

        if (req.body.coupon) {
            const coupon = await stripe.coupons.create({ percent_off: req.body.coupon.amount, duration: 'once' });
            req.body.couponId = coupon.id;
        }

        const session = await payment({
            stripe,
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: req.user.email,
            metadata: {
                orderId: order._id.toString(),
            },
            cancel_url: `${process.env.CANCEL_URL}?orderId=${order._id.toString()}`,
            line_items: order.products.map(product => ({
                price_data: {
                    currency: 'egp',
                    product_data: {
                        name: product.name,
                        images: [product.mainImage.secure_url],
                    },
                    unit_amount: product.unitPrice * 100,
                },
                quantity: product.quntity,
            })),
            discounts: req.body.couponId ? [{ coupon: req.body.couponId }] : [],
        });

        // Generate PDF
        const invoice = {
            shipping: {
                name: req.user.userName,
                address: order.address,
                city: "Cairo",
                state: "Cairo",
                country: "Egypt",
                postal_code: 94111,
            },
            items: order.products,
            subtotal,
            total: order.finalPrice,
            invoice_nr: order._id,
            date: order.createdAt,
        };

        await createInvoice(invoice, "invoice.pdf");

        const emailSend = await sendEmail({
            to: req.user.email,
            message: "Please check your invoice pdf",
            subject: "Invoice",
            attachments: [
                {
                    filename: "invoice.pdf",
                    path: "./invoice.pdf",
                    contentType: "application/pdf",
                },
            ],
        });

        if (!emailSend) {
            return res.json({ message: 'Email Rejected' })
        }

        return res.status(201).json({ message: "Done", order, url: session.url });
    }

    return res.status(201).json({ message: "Done", order });
};

export const cancelOrder = async (req, res, next) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    const order = await orderModel.findOne({ _id: orderId, userId: req.user._id });
    if (!order) {
        return next(new Error("In-valid order id", { cause: 400 }));
    }
    if ((order?.status != "placed" && order.paymentType == 'cash') || (order?.status != "waitPayment" && order.paymentType == 'card')) {
        return next(new Error(`cannot cancel your order after it been changed it ${order.status}`, { cause: 400 }));
    }
    const cancelOrder = await orderModel.updateOne({ _id: order._id }, { status: "cancel", reason, updatedBy: req.user._id });
    if (!cancelOrder.matchedCount) {
        return next(new Error("fail to cancel your order", { cause: 400 }));
    }
    // retreive product to stock
    for (const product of order.products) {
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: parseInt(product.quntity) } })
    }
    // push user id in coupon userBy
    if (order.couponId) {
        await couponModel.updateOne({ _id: order.couponId }, { $addToSet: { usedBy: req.user._id } })
    }
    return res.status(200).json({ message: "Done" });
}
export const updateOrderStatusByAdmin = async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await orderModel.findOne({ _id: orderId });
    if (!order) {
        return next(new Error("In-valid order id", { cause: 404 }));
    }
    const cancelOrder = await orderModel.updateOne({ _id: order._id }, { status, updatedBy: req.user._id });
    if (!cancelOrder.matchedCount) {
        return next(new Error("fail to update order", { cause: 400 }));
    }
    return res.status(200).json({ message: "Done" })
}
