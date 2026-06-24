import { Router } from 'express';
import Settings from '../models/Settings.js';

const router = Router();

// GET /api/settings — get settings (default key)
router.get('/', async (_req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'default' });
    if (!settings) {
      settings = await Settings.create({ key: 'default' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings — update settings
router.put('/', async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { key: 'default' },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
