import { Router } from 'express';
import { exportCSV, exportExcel } from '../controllers/export.controller.js';

const router = Router();

router.get('/excel', exportExcel);
router.get('/csv', exportCSV);

export default router;
