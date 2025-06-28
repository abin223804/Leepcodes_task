import express from "express";
import {Cart, CartItem, Product} from "../models/index.js";
import {authenticate, authorize} from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/", authenticate, authorize("user"), async (req, res) => {
    try {
        const cart = await Cart.findOne({
            where: {UserId: req.user.id},
            include: {
                model: Product,
                through: {
                    attributes: ["quantity"],
                },
            },
        });

        if (!cart) {
            return res.json({Products: []});
        }

        const productsWithTotal = cart.Products.map((p) => ({
            ...p.toJSON(),
            totalPrice: p.price * p.CartItem.quantity,
        }));

        return res.json({Products: productsWithTotal});
    } catch (err) {
        console.error("Cart fetch error:", err);
        res.status(500).json({message: "Server error"});
    }
});

router.post("/add", authenticate, authorize("user"), async (req, res) => {
    const {productId, quantity} = req.body;

    if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({message: "Valid product ID and quantity are required"});
    }

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({message: "Product not found"});
        }

        if (quantity > product.stock) {
            return res.status(400).json({message: `Only ${product.stock} items in stock`});
        }

        let cart = await Cart.findOne({where: {UserId: req.user.id}});
        if (!cart) {
            cart = await Cart.create({UserId: req.user.id});
        }

        const existingItem = await CartItem.findOne({
            where: {CartId: cart.id, ProductId: productId},
        });

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stock) {
                return res.status(400).json({message: `Only ${product.stock} items in stock`});
            }
            existingItem.quantity = newQuantity;
            await existingItem.save();
            return res.json({message: "Cart quantity updated"});
        } else {
            await CartItem.create({
                CartId: cart.id,
                ProductId: productId,
                quantity,
            });
            return res.status(201).json({message: "Product added to cart"});
        }
    } catch (err) {
        console.error("Add to cart error:", err);
        return res.status(500).json({message: "Internal server error"});
    }
});

router.put("/update", authenticate, authorize("user"), async (req, res) => {
    const {productId, quantity} = req.body;
    const cart = await Cart.findOne({where: {UserId: req.user.id}});
    await CartItem.update({quantity}, {where: {CartId: cart.id, ProductId: productId}});
    res.json({message: "Quantity updated"});
});

router.delete("/remove/:productId", authenticate, authorize("user"), async (req, res) => {
    const cart = await Cart.findOne({where: {UserId: req.user.id}});
    await CartItem.destroy({where: {CartId: cart.id, ProductId: req.params.productId}});
    res.json({message: "Removed from cart"});
});

export default router;
