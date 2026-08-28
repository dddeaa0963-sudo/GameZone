import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser, loginUser, syncUsers } from '../controllers/userController';

const router = express.Router();

router.post('/login', loginUser);
router.post('/sync', syncUsers);
router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

export default router;
