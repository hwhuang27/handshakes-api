import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
dotenv.config();

import { jwtEncoded, jwtDecoded } from '../auth/jwtConfig';
import User from '../models/User';

export const fetch_user = [
    asyncHandler((req, res, _next) => {
        const user = req.user as jwtDecoded;

        const result: jwtEncoded = {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar,
        };

        res.status(200).json({
            success: true,
            user: result,
        });
    })
];

export const edit_user = [
    body("first_name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("First name must be specified."),
    body("last_name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Last name must be specified."),

    asyncHandler(async (req, res, _next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).json({
                message: `Error editing profile`,
                errors: errors.array(),
            });
        } else {
            const user = req.user as jwtDecoded;

            await User.updateOne(
                { email: user.email }, 
                { 
                    first_name: req.body.first_name, 
                    last_name: req.body.last_name, 
                    avatar: req.body.avatar
                });

            res.status(200).json({
                message: `User updated successfully.`
            });
        }
    })
];

export const fetch_users = [
    asyncHandler(async (req, res, _next) => {
        const user = req.user as jwtDecoded;

        // returns all users minus current user
        const users = await User
            .find({ email: { $nin: user.email} })
            .select({ password: 0, refreshTokens: 0 });

        res.status(200).json({
            success: true,
            users: users,
        });
    })
];
