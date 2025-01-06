import express from 'express';
import authRouter from './authRoute.js'
import transportRouter from './transportRoute.js'

const router = express.Router();
router.stack = [
	...router.stack, 
    ...authRouter,
    ...transportRouter,
]

export default router;