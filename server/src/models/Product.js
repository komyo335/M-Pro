import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: ['drinks', 'food', 'snacks', 'merch'] },
  emoji: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
