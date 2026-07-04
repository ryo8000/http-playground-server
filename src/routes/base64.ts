import { Router } from 'express';
import { encodeBase64, decodeBase64 } from '../services/base64.js';

const base64Router = Router();

base64Router.all('/encode', (req, res) => {
  const result = encodeBase64(req.body);
  res.status(result.status).json(result.body);
});

base64Router.all('/decode', (req, res) => {
  const result = decodeBase64(req.body);
  res.status(result.status).json(result.body);
});

export { base64Router };
