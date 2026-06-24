import { Router } from 'express';
import Staff from '../models/Staff.js';

const router = Router();

// GET /api/staff — list all staff (sorted by name)
router.get('/', async (_req, res) => {
  try {
    const staff = await Staff.find().sort({ name: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/staff/:id — get one staff member
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findOne({ id: req.params.id });
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/staff — create a new staff member
router.post('/', async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json(staff);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/staff/:id — update a staff member
router.put('/:id', async (req, res) => {
  try {
    const staff = await Staff.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    res.json(staff);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/staff/:id — delete a staff member
router.delete('/:id', async (req, res) => {
  try {
    const staff = await Staff.findOneAndDelete({ id: req.params.id });
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    res.json({ message: 'Staff member deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
