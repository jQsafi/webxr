const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 8000;
const url = `http://localhost:${port}`;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Create HTTP server
app.listen(port, () => {
  console.log(`HTTP server listening on ${url}`);

  // Auto-open browser
  const command = process.platform === 'darwin' ? 'open' :
    process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${command} ${url}`, (error) => {
    if (error) {
      console.log('Could not auto-open browser. Please open manually:', url);
    } else {
      console.log('Browser opened automatically!');
    }
  });
});