import { Router } from 'express';
import { log } from '../logger.js';
import { base64Encode, base64Decode } from '../services/base64.js';
import { HttpStatusCodes } from '../utils/http.js';

const base64Router = Router();

base64Router.all('/encode', (req, res) => {
  let result;
  try {
    result = base64Encode(req.body);
  } catch (err) {
    log.error({ err }, 'Failed to encode value to Base64');
    res
      .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: { message: 'Failed to encode value to Base64' } });
    return;
  }
  res.status(result.status).json(result.body);
});

base64Router.all('/decode', (req, res) => {
  let result;
  try {
    result = base64Decode(req.body);
  } catch (err) {
    log.error({ err }, 'An unexpected error occurred during decoding.');
    res
      .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: { message: 'An unexpected error occurred during decoding.' } });
    return;
  }
  res.status(result.status).json(result.body);
});

export { base64Router };
