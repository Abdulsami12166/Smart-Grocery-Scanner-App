import { Router } from 'express';
import {
  deleteProduct,
  getAlerts,
  getInventory,
  getRecipeSuggestions,
  scanProduct,
  updateQuantity
} from '../controllers/productController.js';

const router = Router();

router.post('/scan', scanProduct);
router.get('/', getInventory);
router.patch('/:id/quantity', updateQuantity);
router.delete('/:id', deleteProduct);
router.get('/alerts', getAlerts);
router.get('/recipes/suggestions', getRecipeSuggestions);

export default router;
