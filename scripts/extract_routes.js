const fs = require('fs');
const path = require('path');

// Base directory of the web app
const webRoot = path.resolve(__dirname, '..', 'kickoff-web');

// Directories where Next.js pages may live
const possibleDirs = ['app', 'pages'];

function isPageFile(file) {
  const ext = path.extname(file);
  return ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
}

function extractRoutes() {
  const routes = [];
  for (const dir of possibleDirs) {
    const fullDir = path.join(webRoot, dir);
    if (!fs.existsSync(fullDir)) continue;
    const walk = (current, prefix) => {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = path.join(current, entry.name);
        const relPath = path.relative(fullDir, entryPath);
        const routePath = '/' + relPath.replace(/\\/g, '/').replace(/\.(js|jsx|ts|tsx)$/, '');
        if (entry.isDirectory()) {
          // Recurse into nested folders
          walk(entryPath, prefix + entry.name + '/');
        } else if (entry.isFile() && isPageFile(entry.name)) {
          // Handle index files as root of the folder
          const route = routePath.replace(/\/index$/, '/');
          routes.push(route.replace(/\/\/+/, '/'));
        }
      }
    };
    walk(fullDir, '/');
  }
  // Clean up duplicate slashes and trailing slash for root
  const unique = Array.from(new Set(routes.map(r => r === '/' ? '/' : r.replace(/\/$/, ''))));
  return unique.sort();
}

if (require.main === module) {
  const routes = extractRoutes();
  console.log('Detected routes:');
  routes.forEach(r => console.log(r));
}
module.exports = { extractRoutes };
