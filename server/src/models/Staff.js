import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['manager', 'barista', 'cashier', 'server', 'chef'] },
  shift: { type: String, required: true, enum: ['morning', 'afternoon', 'evening'] },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, required: true, enum: ['active', 'on-break', 'off'] },
  hireDate: { type: String, required: true },
  emoji: { type: String, required: true },
  ordersHandled: { type: Number, required: true, default: 0 },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Staff', staffSchema);
