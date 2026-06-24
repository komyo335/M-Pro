import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  demographic: { type: String, required: true, enum: ['boy', 'girl', 'children', 'men', 'women'] },
  visits: { type: Number, required: true, default: 0 },
  totalSpent: { type: Number, required: true, default: 0 },
  lastVisit: { type: String, required: true },
  favoriteItem: { type: String, required: true },
  emoji: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
