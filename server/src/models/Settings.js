import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'default' },
  theme: { type: String, default: 'light', enum: ['light', 'dark'] },
  fontSize: { type: String, default: 'medium', enum: ['small', 'medium', 'large'] },
  paymentMethods: {
    type: [String],
    default: ['cash', 'card', 'mobile'],
  },
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
