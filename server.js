import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

function refreshHeadlines() {
  console.log('[Server] Refreshing headlines...');
  exec('node scripts/fetch-headlines.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`[Server] Error fetching headlines: ${error.message}`);
      return;
    }
    if (stderr) {
      console.warn(`[Server] Headlines fetch warning: ${stderr}`);
    }
    console.log(`[Server] Headlines output:\n${stdout}`);
  });
}

// Serve static files from root
app.use(express.static(__dirname));

// Route to manually refresh headlines
app.post('/api/refresh-headlines', (req, res) => {
  exec('node scripts/fetch-headlines.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error refreshing headlines: ${error.message}`);
      return res.status(500).json({ error: 'Failed to refresh headlines' });
    }
    res.json({ message: 'Headlines refreshed successfully', output: stdout });
  });
});

// SPA / static fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Daily Wrap server listening on http://0.0.0.0:${PORT}`);
  refreshHeadlines();
  setInterval(refreshHeadlines, 30 * 60 * 1000);
});
