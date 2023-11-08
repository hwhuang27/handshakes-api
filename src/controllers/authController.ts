import createError from 'http-errors';
import asyncHandler from 'express-async-handler';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
dotenv.config();

import User, { IUser } from '../models/User';
import { 
    jwtDecoded, 
    jwtEncoded, 
    cookieOptions,
    ACCESS_TOKEN_KEY, 
    REFRESH_TOKEN_KEY 
} from '../auth/jwtConfig';

export function generateAccessToken(payload: jwtEncoded) {
    return jwt.sign(payload, ACCESS_TOKEN_KEY!, { expiresIn: '1d' });
}

export function generateRefreshToken(payload: jwtEncoded) {
    return jwt.sign(payload, REFRESH_TOKEN_KEY!, { expiresIn: '30d' });
}

export const login = [
    passport.authenticate('local', {
        failureRedirect: '/auth/loginFailure',
        session: false,
    }),
    asyncHandler(async (req, res, _next) => {
        // get user from request
        const user = req.user as IUser;

        const payload: jwtEncoded = {
            _id: user._id.toString(),
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar,
        };

        // generate access and refresh tokens with user payload
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // push refresh token to database user
        await User.findByIdAndUpdate(user._id, {
            $push: { refreshTokens: refreshToken},
        });

        // send refresh token to client through HttpOnly cookie
        res.cookie('jwt', refreshToken, cookieOptions);
        
        // send access token to client for temporary access
        res.json({
            success: true,
            accessToken: accessToken,
        });
    }),
];

export const logout = [
    asyncHandler(async (req, res, _next) => {
        const refreshToken = req.cookies.jwt;

        // remove token from database & clear cookies
        await User.findOneAndUpdate(
            { refreshTokens: refreshToken },
            { $pull: { refreshTokens: refreshToken } }
        );
        res.clearCookie('jwt', cookieOptions);

        res.json({
            success: true,
            message: `Successfully logged out.`,
        });
    })
];

export const refresh = [
    asyncHandler(async (req, _res, next) => {
        const refreshToken = req.cookies.jwt;
        if (!refreshToken) {
            const err = createError(401, `Token not found`);
            return next(err);
        }

        // check if refresh token exists in database
        const result = await User.findOne({ refreshTokens: refreshToken });
        if (!result) {
            const err = createError(403, `Invalid token`);
            return next(err);
        }

        next();
    }),
    asyncHandler(async (req, res, _next) => {
        const refreshToken = req.cookies.jwt;
        try {
            // check if token is valid
            const user = jwt.verify(refreshToken, REFRESH_TOKEN_KEY!) as jwtDecoded;

            // token is valid, create new access token for user
            const payload: jwtEncoded = {
                _id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                avatar: user.avatar,
            };
            const accessToken = generateAccessToken(payload);

            res.json({
                success: true,
                message: `New access token created`,
                accessToken: accessToken,
            });
        } catch (error) {
            // remove expired token from database & clear cookies
            await User.findOneAndUpdate(
                { refreshTokens: refreshToken },
                { $pull: { refreshTokens: refreshToken } }
            );
            res.clearCookie('jwt', cookieOptions);

            res.status(403).json({
                success: false,
                error: error,
            });
        }
    })
];

export const register = [
    // validate form fields
    body("email")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Email must be specified.")
        .custom(async (value) => {
            const user = await User.findOne({email: value});
            if(user) throw new Error('Email is already in use');
        }),
    body("password")
        .trim()
        .isLength({ min: 1 })
        .withMessage('Password must be specified.')
        .escape(),
    body('confirm_password')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Confirm password must be specified.')
        .custom((value, { req }) => {
        return value === req.body.password;
    }),    
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

            // check for validation errors
            if(!errors.isEmpty()){
                res.status(400).json({
                    message: `Error when registering`,
                    email: req.body.email,
                    errors: errors.array(),
                });
            } else {
                // hash password and save user to database
                bcrypt.hash(req.body.password, 10, async(err, hash) => {
                    if (err) throw new Error(`Password failed to hash.`);
                    
                    const user = new User({
                        email: req.body.email,
                        password: hash,
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                    });
                    await user.save();

                    res.status(200).json({
                        message: `User created successfully.`,
                        user,
                    });
                });
            }
    }),
];


