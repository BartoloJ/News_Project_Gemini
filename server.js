import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

function runFetchHeadlines() {
  return new Promise((resolve) => {
    console.log('[Server] Refreshing headlines...');
    exec('node scripts/fetch-headlines.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`[Server] Error fetching headlines: ${error.message}`);
      } else if (stderr) {
        console.warn(`[Server] Headlines fetch warning: ${stderr}`);
      } else {
        console.log('[Server] Headlines refreshed successfully.');
      }
      resolve();
    });
  });
}

function isHeadlinesStale() {
  const filePath = path.join(__dirname, 'headlines.json');
  if (!fs.existsSync(filePath)) return true;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    if (!data.generatedAt) return true;
    const ageMs = Date.now() - new Date(data.generatedAt).getTime();
    return ageMs > 20 * 60 * 1000; // > 20 minutes
  } catch {
    return true;
  }
}

// Disable caching for headlines.json and API endpoints
app.use((req, res, next) => {
  const urlPath = req.path || '';
  if (urlPath.includes('headlines.json') || urlPath.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  next();
});

// Serve static files from root
app.use(express.static(__dirname));

// Route to get or refresh headlines dynamically
async function handleHeadlinesRoute(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.query.force === 'true' || isHeadlinesStale()) {
    await runFetchHeadlines();
  }

  try {
    const content = fs.readFileSync(path.join(__dirname, 'headlines.json'), 'utf8');
    res.json(JSON.parse(content));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read headlines' });
  }
}

app.get('/api/headlines', handleHeadlinesRoute);
app.get('/api/refresh-headlines', handleHeadlinesRoute);
app.post('/api/refresh-headlines', handleHeadlinesRoute);

// SPA / static fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Daily Wrap server listening on http://0.0.0.0:${PORT}`);
  runFetchHeadlines();
  setInterval(runFetchHeadlines, 20 * 60 * 1000);
});

