import { Router } from 'express';
import { assignRoll, getSerialById, getSerials } from '../controllers/serial.controller.js';

const router = Router();

router.get('/', getSerials);
router.get('/:id', getSerialById);
router.put('/:id/assign-roll', assignRoll);

export default router;
