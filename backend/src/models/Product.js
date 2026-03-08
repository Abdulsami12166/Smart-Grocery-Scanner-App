import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    unit: { type: String, default: 'pcs', trim: true },
    expiryDate: { type: Date },
    category: { type: String, default: 'Uncategorized', trim: true },
    notes: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

productSchema.index({ expiryDate: 1 });
productSchema.index({ quantity: 1 });

export const Product = mongoose.model('Product', productSchema);
