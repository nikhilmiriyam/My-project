// Server Entry File
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
