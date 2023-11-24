import express from 'express';
import passport from 'passport';
import * as userController from '../controllers/userController';
import * as chatController from '../controllers/chatController';

const router = express.Router();

// fetch current user info
router.get('/user', 
    passport.authenticate('jwt', { session: false }),
    userController.fetch_self);

// edit current user info
router.put('/user',
    passport.authenticate('jwt', { session: false }),
    userController.edit_self);

// fetch specific user
router.get('/user/:userId',
    passport.authenticate('jwt', { session: false }),
    userController.fetch_user);

// get all users (minus current user)
router.get('/users', 
    passport.authenticate('jwt', { session: false }),
    userController.fetch_users);

// // fetch chat with user, or create new one if none exists
router.post('/chat/:userId',
    passport.authenticate('jwt', { session: false }),
    chatController.fetch_chat);

export default router;