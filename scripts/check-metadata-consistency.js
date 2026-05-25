#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const errors = [];

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/') || '.';
}

function fail(message) {
  errors.push(message);
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch (error) {
    fail(`${rel(file)}: JSON parse failed: ${error.message}`);
    return {};
  }
}

function stripBom(value) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}

function normalizeScalar(raw) {
  let value = String(raw ?? '').trim();
  if (!value) return '';

  const quote = value[0];
  if (quote === '"' || quote === "'") {
    let out = '';
    for (let i = 1; i < value.length; i += 1) {
      const ch = value[i];
      if (quote === '"' && ch === '\\' && i + 1 < value.length) {
        const next = value[i + 1];
        const escapes = { n: '\n', r: '\r', t: '\t', '"': '"', '\\': '\\' };
        out += Object.prototype.hasOwnProperty.call(escapes, next) ? escapes[next] : next;
        i += 1;
        continue;
      }
      if (ch === quote) return out;
      out += ch;
    }
    return out;
  }

  const comment = value.indexOf(' #');
  if (comment !== -1) value = value.slice(0, comment).trimEnd();
  return value;
}

function parseTopLevelYaml(file) {
  const result = {};
  for (const line of stripBom(readText(file)).replace(/\r\n?/g, '\n').split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#') || /^\s/.test(line)) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) result[match[1]] = normalizeScalar(match[2]);
  }
  return result;
}

function parseFrontMatter(file) {
  const text = stripBom(readText(file)).replace(/\r\n?/g, '\n');
  if (!text.startsWith('---\n')) {
    fail(`${rel(file)}: front matter is missing`);
    return { data: {}, body: text };
  }
  const end = text.indexOf('\n---\n', 4);
  if (end === -1) {
    fail(`${rel(file)}: front matter closing marker is missing`);
    return { data: {}, body: text };
  }
  const data = {};
  for (const line of text.slice(4, end).split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#') || /^\s/.test(line)) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) data[match[1]] = normalizeScalar(match[2]);
  }
  return { data, body: text.slice(end + 5) };
}

function readNavigation(file) {
  const nav = {};
  let current = null;
  let currentItem = null;
  for (const line of stripBom(readText(file)).replace(/\r\n?/g, '\n').split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const section = line.match(/^([A-Za-z0-9_-]+):\s*$/);
    if (section) {
      current = section[1];
      nav[current] = [];
      currentItem = null;
      continue;
    }
    const itemTitle = line.match(/^\s*-\s+title:\s*(.*)$/);
    if (itemTitle && current) {
      currentItem = { title: normalizeScalar(itemTitle[1]) };
      nav[current].push(currentItem);
      continue;
    }
    const itemPath = line.match(/^\s+path:\s*(.*)$/);
    if (itemPath && currentItem) currentItem.path = normalizeScalar(itemPath[1]);
  }
  return nav;
}

function requireString(source, value) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) fail(`${source}: expected a non-empty string`);
  return normalized;
}

function normalizeRepoUrl(value, source) {
  return requireString(source, value).replace(/^git\+/, '').replace(/\.git$/, '').replace(/\/$/, '');
}

function assertEqual(source, actual, expected) {
  if (actual !== expected) {
    fail(`${source}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertContains(source, haystack, needle) {
  if (!String(haystack ?? '').includes(needle)) {
    fail(`${source}: expected to contain ${JSON.stringify(needle)}`);
  }
}

function repoUrlFromBook(book) {
  const repo = book.repository;
  if (typeof repo === 'string') return normalizeRepoUrl(repo, 'book-config.json repository');
  return normalizeRepoUrl(repo && repo.url, 'book-config.json repository.url');
}

function expectedChapterPath(chapter) {
  return `/chapters/${chapter.id}/`;
}

function resolveDocsPath(navPath) {
  if (typeof navPath !== 'string' || !navPath.trim()) {
    fail(`navigation path: expected a non-empty string, got ${JSON.stringify(navPath)}`);
    return null;
  }
  let normalized = navPath.trim().replace(/\\/g, '/');
  if (/^[a-z][a-z0-9+.-]*:/i.test(normalized)) {
    fail(`navigation path ${JSON.stringify(navPath)}: URL schemes are not allowed`);
    return null;
  }
  if (normalized.split('/').includes('..')) {
    fail(`navigation path ${JSON.stringify(navPath)}: path traversal is not allowed`);
    return null;
  }
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  const relative = normalized.replace(/^\//, '');
  const candidates = relative === ''
    ? [path.join(DOCS, 'index.md')]
    : [path.join(DOCS, relative, 'index.md'), path.join(DOCS, `${relative.replace(/\/$/, '')}.md`)];
  const docsRoot = `${DOCS}${path.sep}`;
  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (resolved !== DOCS && !resolved.startsWith(docsRoot)) {
      fail(`navigation path ${JSON.stringify(navPath)}: resolved outside docs`);
      return null;
    }
    if (fs.existsSync(resolved)) return resolved;
  }
  fail(`navigation path ${JSON.stringify(navPath)}: target page not found under docs`);
  return candidates[0];
}

const book = readJson(path.join(ROOT, 'book-config.json'));
const legacyYaml = parseTopLevelYaml(path.join(ROOT, 'book-config.yaml'));
const pkg = readJson(path.join(ROOT, 'package.json'));
const docsConfig = parseTopLevelYaml(path.join(DOCS, '_config.yml'));
const index = parseFrontMatter(path.join(DOCS, 'index.md'));
const nav = readNavigation(path.join(DOCS, '_data', 'navigation.yml'));
const repoUrl = repoUrlFromBook(book);
const repoName = repoUrl.split('/').pop();
const pagesUrl = `https://itdojp.github.io/${repoName}/`;

for (const key of ['title', 'description', 'author', 'version', 'license']) {
  assertEqual(`book-config.yaml ${key}`, legacyYaml[key], book[key]);
}

assertEqual('package.json name', pkg.name, repoName);
assertEqual('package.json version', pkg.version, book.version);
assertEqual('package.json description', pkg.description, book.description);
assertEqual('package.json author', pkg.author, book.author);
assertEqual('package.json license', pkg.license, book.license);
assertEqual('package.json repository.url', normalizeRepoUrl(pkg.repository && pkg.repository.url, 'package.json repository.url'), repoUrl);
assertEqual('package.json homepage', pkg.homepage, pagesUrl);
assertEqual('package.json bugs.url', pkg.bugs && pkg.bugs.url, `${repoUrl}/issues`);
assertContains('package.json scripts.test', pkg.scripts && pkg.scripts.test, 'check:metadata');

assertEqual('docs/_config.yml title', docsConfig.title, book.title);
assertEqual('docs/_config.yml description', docsConfig.description, book.description);
assertEqual('docs/_config.yml author', docsConfig.author, book.author);
assertEqual('docs/_config.yml version', docsConfig.version, book.version);
assertEqual('docs/_config.yml url', docsConfig.url, 'https://itdojp.github.io');
assertEqual('docs/_config.yml baseurl', docsConfig.baseurl, `/${repoName}`);
assertEqual('docs/_config.yml repository', docsConfig.repository, `itdojp/${repoName}`);

for (const key of ['title', 'description', 'author', 'version']) {
  assertEqual(`docs/index.md front matter ${key}`, index.data[key], book[key]);
}
assertEqual('docs/index.md permalink', index.data.permalink, '/');
assertContains('docs/index.md body', index.body, 'site.data.navigation.chapters');

const chapters = (book.structure && book.structure.chapters) || [];
const navChapters = nav.chapters || [];
assertEqual('book-config.json chapter count', chapters.length, 5);
assertEqual('docs/_data/navigation.yml chapter count', navChapters.length, chapters.length);

for (const [i, chapter] of chapters.entries()) {
  const expectedPath = expectedChapterPath(chapter);
  const navItem = navChapters[i] || {};
  assertEqual(`navigation chapter ${i + 1} title`, navItem.title, chapter.title);
  assertEqual(`navigation chapter ${i + 1} path`, navItem.path, expectedPath);
  const page = resolveDocsPath(expectedPath);
  if (page) {
    const frontMatter = parseFrontMatter(page).data;
    assertEqual(`${rel(page)} title`, frontMatter.title, chapter.title);
  }
}

const readme = readText(path.join(ROOT, 'README.md'));
assertContains('README.md', readme, pagesUrl);
assertContains('README.md', readme, 'npm run check:metadata');
assertContains('README.md', readme, 'npm test');

if (errors.length > 0) {
  console.error('Metadata consistency check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Metadata consistency check passed.');
