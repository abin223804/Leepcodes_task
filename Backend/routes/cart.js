import express from 'express';
import { Cart, CartItem, Product } from '../models/index.js';
import { authenticate, authorize } from '../middlewares/authMiddlewares.js';

const router = express.Router();

router.get('/', authenticate, authorize('user'), async (req, res) => {
  const cart = await Cart.findOne({ where: { UserId: req.user.id }, include: Product });
  res.json(cart);
});

router.post('/add', authenticate, authorize('user'), async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ where: { UserId: req.user.id } });
  if (!cart) cart = await Cart.create({ UserId: req.user.id });
  await CartItem.upsert({ CartId: cart.id, ProductId: productId, quantity });
  res.json({ message: 'Added to cart' });
});


router.post('/', authenticate, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (!productId || !quantity) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }

  try {
    const existing = await Cart.findOne({ where: { userId, productId } });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json({ message: 'Quantity updated' });
    }

    await Cart.create({ userId, productId, quantity });
    res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    console.error('Cart Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/update', authenticate, authorize('user'), async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ where: { UserId: req.user.id } });
  await CartItem.update({ quantity }, { where: { CartId: cart.id, ProductId: productId } });
  res.json({ message: 'Quantity updated' });
});

router.delete('/remove/:productId', authenticate, authorize('user'), async (req, res) => {
  const cart = await Cart.findOne({ where: { UserId: req.user.id } });
  await CartItem.destroy({ where: { CartId: cart.id, ProductId: req.params.productId } });
  res.json({ message: 'Removed from cart' });
});

export default router;