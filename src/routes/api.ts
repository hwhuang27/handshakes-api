
import express from 'express';
import passport from 'passport';
import * as userController from '../controllers/userController';
import * as chatController from '../controllers/chatController';

const router = express.Router();

// fetch current user info
router.get('/user', 
    passport.authenticate('jwt', { session: false }),
    userController.fetch_user);

// edit current user info
router.put('/user',
    passport.authenticate('jwt', { session: false }),
    userController.edit_user);

// get all users (minus current user)
router.get('/users', 
    passport.authenticate('jwt', { session: false }),
    userController.fetch_users);

// post message with socket io
router.post('/messages',
    passport.authenticate('jwt', { session: false }),
    chatController.send_message);

// fetch all messages with socket io
router.get('/messages',
    passport.authenticate('jwt', { session: false }),
    chatController.fetch_messages);

export default router;