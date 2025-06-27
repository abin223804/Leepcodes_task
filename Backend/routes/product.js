import express from 'express';
import { Product } from '../models/index.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

router.post('/', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});

router.put('/:id', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  await product.update(req.body);
  res.json(product);
});

router.delete('/:id', authenticate, authorize('superadmin'), async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  await product.destroy();
  res.json({ message: 'Deleted' });
});

export default router;