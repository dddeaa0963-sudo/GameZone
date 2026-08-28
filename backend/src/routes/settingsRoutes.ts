import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
const router = express.Router();
router.route('/').get(getSettings).post(updateSettings);
export default router;
