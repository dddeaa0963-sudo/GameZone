import express from 'express';
import { getWishlist, toggleWishlistItem } from '../controllers/wishlistController';

const router = express.Router();

router.get('/:userId', getWishlist);
router.post('/toggle', toggleWishlistItem);

export default router;
