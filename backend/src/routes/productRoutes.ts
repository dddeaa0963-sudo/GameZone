import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, syncProducts } from '../controllers/productController';

const router = express.Router();

router.post('/sync', syncProducts);
router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProductById).put(updateProduct).delete(deleteProduct);

export default router;
