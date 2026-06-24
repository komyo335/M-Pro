import { Router } from 'express';
import Order from '../models/Order.js';

const router = Router();

// GET /api/orders — list all orders (newest first)
router.get('/', async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders — create a new order
router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/orders — clear all orders
router.delete('/', async (_req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: 'All orders cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
