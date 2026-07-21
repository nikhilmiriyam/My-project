// Server Entry File
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const clientDir = path.join(__dirname, '..', 'client');

app.use(cors());
app.use(express.json());
app.use(express.static(clientDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(clientDir, 'dashboard.html'));
});

app.get('/account.html', (req, res) => {
  res.sendFile(path.join(clientDir, 'account.html'));
});

app.get('/history.html', (req, res) => {
  res.sendFile(path.join(clientDir, 'history.html'));
});

app.get('/signin.html', (req, res) => {
  res.sendFile(path.join(clientDir, 'signin.html'));
});

app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(clientDir, 'signup.html'));
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the process using that port or set PORT to a different value.`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});
