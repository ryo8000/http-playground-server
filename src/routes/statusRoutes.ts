import { Router } from 'express';
import { HTTP_STATUS_CODE_MAP } from '../constants';

const statusRouter = Router();

statusRouter.get('/:status', (req, res) => {
  const reqStatucCode = parseInt(req.params.status);
  const statucCode =
    reqStatucCode >= 100 && reqStatucCode <= 599 ? reqStatucCode : 400;
  res.status(statucCode).json({
    code: statucCode,
    message: HTTP_STATUS_CODE_MAP[statucCode] || 'unknown',
  });
});

export { statusRouter };
