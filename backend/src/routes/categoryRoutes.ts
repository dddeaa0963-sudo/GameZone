import express from 'express';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, syncCategories } from '../controllers/categoryController';

const router = express.Router();

router.post('/sync', syncCategories);
router.route('/').get(getCategories).post(createCategory);
router.route('/:id').get(getCategoryById).put(updateCategory).delete(deleteCategory);

export default router;
