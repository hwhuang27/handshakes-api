
import express from 'express';
import * as authController from "../controllers/authController";

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.get('/refresh', authController.refresh);

router.get('/loginFail', (req, res) => {
    res.status(401).json({
        error: `Failed to login`,
    });
});

export default router;