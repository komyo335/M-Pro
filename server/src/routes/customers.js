import { Router } from 'express';
import Customer from '../models/Customer.js';

const router = Router();

// GET /api/customers — list all customers (sorted by name)
router.get('/', async (_req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/:id — get one customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ id: req.params.id });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customers — create a new customer
router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/customers/:id — update a customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/customers/:id — delete a customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ id: req.params.id });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
