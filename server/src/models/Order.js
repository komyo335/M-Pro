import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    emoji: { type: String, required: true },
  },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  items: { type: [cartItemSchema], required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  createdAt: { type: String, required: true },
  customerName: { type: String },
  customerType: { type: String, enum: ['dine-in', 'takeout', 'delivery'] },
  customerId: { type: String },
  customerDemographic: { type: String, enum: ['boy', 'girl', 'children', 'men', 'women'] },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
