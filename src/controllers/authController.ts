import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';

const authController = (() => {

    const handle_login = [
        // authenticate with LocalStrategy
        passport.authenticate('local', {
            failureRedirect: '/auth/loginFailure',
            session: false
        }),
        // handle Login
        asyncHandler(async (req, res, next) => {
            res.json({
                success: true,
                message: 'login route',
            });
        }),
    ];

    const handle_register = [
        asyncHandler(async (req, res, next) => {
            res.json({
                message: 'register route',
            });
        }),
    ];

    return {
        handle_login,
        handle_register,
    };
})();

export default authController;
