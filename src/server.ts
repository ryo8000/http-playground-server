import express from 'express';

const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/status/:status', (req, res) => {
  const status = parseInt(req.params.status);

  if (status < 100 || status >= 600) {
    res.sendStatus(400);
  } else {
    res.sendStatus(status);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
