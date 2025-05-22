import { Router } from 'express';

const requestRouter = Router();

requestRouter.all('/', (req, res) => {
  res.json({
    ip: req.ip,
    httpVersion: req.httpVersion,
    protocol: req.protocol,
    host: req.host,
    method: req.method,
    query: req.query,
    headers: req.headers,
    body: req.method === 'GET' || req.body === undefined ? {} : req.body,
    cookies: req.cookies,
  });
});

export { requestRouter };
