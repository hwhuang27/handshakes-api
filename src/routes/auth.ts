
import express from 'express';
import * as authController from "../controllers/authController";

const router = express.Router();

router.post('/register', authController.handle_register);
router.post('/login', authController.handle_login);
router.post('/refresh', authController.handle_refresh);
router.get('/loginFail', (req, res) => {
    res.status(401).json({
        error: `Failed to login`,
    });
});

export default router;