import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
dotenv.config();

import { jwtEncoded, jwtDecoded } from '../auth/jwtConfig';
import User from '../models/User';

export const user = [
    asyncHandler(async (req, res, next) => {
        const user = req.user as jwtDecoded;

        const result: jwtEncoded = {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar,
        }

        res.status(200).json({
            success: true,
            user: result,
        });
    })
];

export const users = [
    asyncHandler(async (req, res, next) => {
        const user = req.user as jwtDecoded;

        // returns all users minus current user
        const users = await User
            .find({ email: { $nin: user.email} })
            .select({ password: 0, refreshTokens: 0 });

        res.status(200).json({
            success: true,
            users: users,
        })
    })
];
