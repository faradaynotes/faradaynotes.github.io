// Faraday Notes — Sitemap Generator
// Reads posts/posts.json, writes sitemap.xml
// Run automatically by GitHub Actions on every push to main

const fs   = require('fs');
const path = require('path');

const BASE_URL = 'https://faradaynotes.com';
const today    = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// Root pages — fixed, never change
const rootPages = [
  { url: '/',             changefreq: 'weekly',  priority: '1.0' },
  { url: '/about.html',   changefreq: 'monthly', priority: '0.8' },
  { url: '/topics.html',  changefreq: 'monthly', priority: '0.7' },
  { url: '/contact.html', changefreq: 'yearly',  priority: '0.5' },
];

// Read posts
const postsPath = path.join(__dirname, 'posts', 'posts.json');
let posts = [];
try {
  posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
} catch (e) {
  console.error('Could not read posts/posts.json:', e.message);
  process.exit(1);
}

// Build XML
function urlEntry({ url, changefreq, priority, lastmod }) {
  return [
    '  <url>',
    '    <loc>' + BASE_URL + url + '</loc>',
    lastmod ? '    <lastmod>' + lastmod + '</lastmod>' : null,
    '    <changefreq>' + changefreq + '</changefreq>',
    '    <priority>' + priority + '</priority>',
    '  </url>',
  ].filter(Boolean).join('\n');
}

const rootEntries = rootPages.map(urlEntry).join('\n');

const postEntries = posts.map(function (post) {
  return urlEntry({
    url:        '/posts/' + post.slug + '/',
    changefreq: 'monthly',
    priority:   '0.9',
    lastmod:    post.date || today,
  });
}).join('\n');

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  rootEntries,
  postEntries,
  '</urlset>',
  '', // trailing newline
].join('\n');

const outPath = path.join(__dirname, 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log('sitemap.xml written with ' + (rootPages.length + posts.length) + ' URLs.');
