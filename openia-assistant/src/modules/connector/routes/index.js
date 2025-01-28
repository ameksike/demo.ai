import express from 'express';
import controller from '../controllers/index.js';

export const router = express.Router();

router.get('/', controller.list.bind(controller));
router.get('/:id', controller.select.bind(controller));

export default router;
