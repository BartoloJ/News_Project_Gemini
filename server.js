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

// Route to get cached headlines (automatically refreshes server-side if >15 minutes old)
function isHeadlinesStale() {
  const filePath = path.join(__dirname, 'headlines.json');
  if (!fs.existsSync(filePath)) return true;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const time = data.fetchedAt || data.lastChecked || data.lastUpdated || data.generatedAt;
    if (!time) return true;
    const ageMs = Date.now() - new Date(time).getTime();
    return ageMs > 15 * 60 * 1000; // > 15 minutes
  } catch {
    return true;
  }
}

let ongoingFetch = null;

async function handleHeadlinesRoute(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const filePath = path.join(__dirname, 'headlines.json');
    if (isHeadlinesStale()) {
      if (!ongoingFetch) {
        ongoingFetch = runFetchHeadlines().finally(() => { ongoingFetch = null; });
      }
      if (!fs.existsSync(filePath)) {
        await ongoingFetch;
      }
    }

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      res.json(JSON.parse(content));
    } else {
      res.status(500).json({ error: 'Headlines not yet available' });
    }
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
  setInterval(runFetchHeadlines, 15 * 60 * 1000);
});

