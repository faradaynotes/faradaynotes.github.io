// Faraday Notes — Posts Manifest Generator
// Scans posts/ subfolders for meta.json files, assembles posts/posts.json
// Sorted newest-first by date field (ISO 8601: YYYY-MM-DD)
// Run automatically by GitHub Actions when any post meta.json changes
const fs   = require('fs');
const path = require('path');
const postsDir   = path.join(__dirname, '..', 'posts');
const outputPath = path.join(__dirname, '..', 'posts', 'posts.json');
// Find all posts/*/meta.json files
let entries = [];
const subdirs = fs.readdirSync(postsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);
subdirs.forEach(function (slug) {
  const metaPath = path.join(postsDir, slug, 'meta.json');
  if (!fs.existsSync(metaPath)) {
    console.warn('Skipping ' + slug + ' — no meta.json found.');
    return;
  }
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch (e) {
    console.error('Could not parse meta.json in ' + slug + ':', e.message);
    return;
  }
  // Validate required fields
  const required = ['slug', 'title', 'excerpt', 'date', 'tags'];
  const missing = required.filter(f => !meta[f]);
  if (missing.length) {
    console.error('meta.json in ' + slug + ' is missing fields: ' + missing.join(', '));
    return;
  }
  // Enforce slug matches folder name
  if (meta.slug !== slug) {
    console.warn(
      'meta.json slug "' + meta.slug + '" does not match folder name "' + slug + '". Using folder name.'
    );
    meta.slug = slug;
  }
  entries.push(meta);
});
if (!entries.length) {
  console.error('No valid post entries found. posts.json not written.');
  process.exit(1);
}
// Sort newest-first by date
entries.sort(function (a, b) {
  return new Date(b.date) - new Date(a.date);
});
fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2) + '\n', 'utf8');
console.log('posts/posts.json written with ' + entries.length + ' post(s):');
entries.forEach(function (e) {
  console.log('  ' + e.date + '  ' + e.slug);
});
