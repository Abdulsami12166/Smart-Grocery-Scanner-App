import { Product } from '../models/Product.js';
import { suggestRecipes } from '../services/recipeService.js';

const getReminderCutoffDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const scanProduct = async (req, res) => {
  try {
    const { barcode, name, expiryDate, category, unit, quantity = 1, notes = '' } = req.body;

    if (!barcode || !name) {
      return res.status(400).json({ message: 'barcode and name are required' });
    }

    const product = await Product.findOneAndUpdate(
      { barcode },
      {
        $set: {
          name,
          category: category ?? 'Uncategorized',
          unit: unit ?? 'pcs',
          notes,
          ...(expiryDate ? { expiryDate } : {})
        },
        $inc: { quantity }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to scan product', error: error.message });
  }
};

export const getInventory = async (_req, res) => {
  try {
    const products = await Product.find().sort({ updatedAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch inventory', error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'quantity must be a number greater than or equal to 0' });
    }

    const product = await Product.findByIdAndUpdate(id, { quantity }, { new: true });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update quantity', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const lowStockThreshold = Number(process.env.LOW_STOCK_THRESHOLD ?? 2);
    const expiryReminderDays = Number(process.env.EXPIRY_REMINDER_DAYS ?? 3);

    const expiringSoon = await Product.find({
      expiryDate: {
        $ne: null,
        $lte: getReminderCutoffDate(expiryReminderDays)
      }
    }).sort({ expiryDate: 1 });

    const lowStock = await Product.find({ quantity: { $lte: lowStockThreshold } }).sort({ quantity: 1 });

    return res.status(200).json({
      expiryReminderDays,
      lowStockThreshold,
      expiringSoon,
      lowStock
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch alerts', error: error.message });
  }
};

export const getRecipeSuggestions = async (_req, res) => {
  try {
    const products = await Product.find();
    const suggestions = suggestRecipes(products);

    return res.status(200).json(suggestions);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch recipe suggestions', error: error.message });
  }
};
