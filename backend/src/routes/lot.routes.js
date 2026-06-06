import { Router } from 'express';
import {
  deleteLot,
  generateLot,
  getLotById,
  getLots,
  updateLot
} from '../controllers/lot.controller.js';

const router = Router();

router.post('/generate', generateLot);
router.get('/', getLots);
router.get('/:id', getLotById);
router.put('/:id', updateLot);
router.delete('/:id', deleteLot);

export default router;
