
import express from 'express';
import passport from 'passport';
import * as userController from '../controllers/userController';

const router = express.Router();

router.get('/user', 
    passport.authenticate('jwt', { session: false }),
    userController.profile);

export default router;