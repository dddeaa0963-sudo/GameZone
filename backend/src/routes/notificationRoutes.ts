import express from 'express';
import { getNotifications, createNotification, updateNotification } from '../controllers/notificationController';
const router = express.Router();
router.route('/').get(getNotifications).post(createNotification);
router.route('/:id').put(updateNotification);
export default router;
