const express = require('express');
const https = require('https');
const selfsigned = require('selfsigned');
const path = require('path');

const app = express();
const port = 8000;

// Generate self-signed certificate
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365, keySize: 2048 });

const options = {
  key: pems.private,
  cert: pems.cert
};

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Create HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS server listening on https://localhost:${port}`);
});