import express from 'express';
import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, syncOrderProvider } from '../controllers/orderController';

const router = express.Router();

router.route('/').get(getOrders).post(createOrder);
router.route('/:id').get(getOrderById).put(updateOrder).delete(deleteOrder);
router.route('/:id/sync-provider').put(syncOrderProvider);

export default router;
