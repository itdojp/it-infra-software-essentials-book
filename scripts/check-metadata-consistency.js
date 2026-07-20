#!/usr/bin/env node
'use strict';

/*
 * Validates the published reader UX contract as well as the repository
 * metadata. The checks intentionally start from both directions:
 * configured modules must have published routes, and every managed route,
 * source figure reference, and asset must be part of the declared contract.
 */

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const rootArgument = args.indexOf('--root');
const ROOT = rootArgument === -1
  ? path.resolve(__dirname, '..')
  : path.resolve(args[rootArgument + 1] || '.');
const SKIP_NEGATIVE = args.includes('--skip-negative');
const DOCS = path.join(ROOT, 'docs');
const SRC = path.join(ROOT, 'src');
const errors = [];

const APPENDICES = [
  {
    id: 'troubleshooting',
    path: 'src/appendices/troubleshooting',
    route: '/appendices/troubleshooting/',
    title: '付録A：トラブルシューティングフロー',
    module: 'troubleshootingFlow',
  },
  {
    id: 'figure-index',
    path: 'src/appendices/figure-index',
    route: '/appendices/figure-index/',
    title: '付録B：図表索引',
    module: 'figureIndex',
  },
];

const FIGURES = [
  {
    chapter: 'chapter01',
    asset: 'chapter01/traditional-vs-modern-infrastructure.svg',
    anchor: 'figure-traditional-vs-modern-infrastructure',
    title: '従来インフラ vs 現代インフラ',
  },
  {
    chapter: 'chapter01',
    asset: 'chapter01/devops-transformation.svg',
    anchor: 'figure-devops-transformation',
    title: 'DevOps 変革フロー',
  },
  {
    chapter: 'chapter01',
    asset: 'chapter01/sre-concepts.svg',
    anchor: 'figure-sre-concepts',
    title: 'SRE 概念図',
  },
  {
    chapter: 'chapter01',
    asset: 'chapter01/learning-roadmap.svg',
    anchor: 'figure-learning-roadmap',
    title: '学習ロードマップ',
  },
  {
    chapter: 'chapter02',
    asset: 'chapter02/data-description-languages-overview.svg',
    anchor: 'figure-data-description-languages-overview',
    title: 'データ記述言語の全体像',
  },
  {
    chapter: 'chapter03',
    asset: 'chapter03/script-automation-architecture.svg',
    anchor: 'figure-script-automation-architecture',
    title: 'スクリプト自動化アーキテクチャ',
  },
];

const EXCLUDED_ASSETS = [
  'chapter01/api-workflow.svg',
  'chapter01/devops-collaboration.svg',
  'data-structures.svg',
  'programming-paradigms.svg',
  'software-architecture-layers.svg',
];

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/') || '.';
}

function fail(message) {
  errors.push(message);
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    fail(`${rel(file)}: cannot read file (${error.code || error.message})`);
    return '';
  }
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
  return comment === -1 ? value : value.slice(0, comment).trimEnd();
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
  let section = null;
  let item = null;
  for (const line of stripBom(readText(file)).replace(/\r\n?/g, '\n').split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const sectionMatch = line.match(/^([A-Za-z0-9_-]+):\s*$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      nav[section] = [];
      item = null;
      continue;
    }
    const titleMatch = line.match(/^\s*-\s+title:\s*(.*)$/);
    if (titleMatch && section) {
      item = { title: normalizeScalar(titleMatch[1]) };
      nav[section].push(item);
      continue;
    }
    const pathMatch = line.match(/^\s+path:\s*(.*)$/);
    if (pathMatch && item) item.path = normalizeScalar(pathMatch[1]);
  }
  return nav;
}

function readLegacyAppendices(file) {
  const result = [];
  const lines = stripBom(readText(file)).replace(/\r\n?/g, '\n').split('\n');
  let inAppendices = false;
  let current = null;
  for (const line of lines) {
    if (/^  appendices:\s*$/.test(line)) {
      inAppendices = true;
      continue;
    }
    if (inAppendices && /^  [A-Za-z0-9_-]+:/.test(line)) break;
    if (!inAppendices) continue;
    const pathMatch = line.match(/^    - path:\s*(.*)$/);
    if (pathMatch) {
      current = { path: normalizeScalar(pathMatch[1]) };
      result.push(current);
      continue;
    }
    const titleMatch = line.match(/^      title:\s*(.*)$/);
    if (titleMatch && current) current.title = normalizeScalar(titleMatch[1]);
  }
  return result;
}

function requireString(source, value) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) fail(`${source}: expected a non-empty string`);
  return normalized;
}

function assertEqual(source, actual, expected) {
  if (actual !== expected) {
    fail(`${source}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertArrayEqual(source, actual, expected) {
  assertEqual(source, JSON.stringify(actual), JSON.stringify(expected));
}

function assertContains(source, haystack, needle) {
  if (!String(haystack ?? '').includes(needle)) {
    fail(`${source}: expected to contain ${JSON.stringify(needle)}`);
  }
}

function readmeChapterBlock(readme, position, title, nextTitle) {
  const readmeTitle = title.replace(/^第\d+章：/, '');
  const marker = `${position}. **${readmeTitle}**`;
  const start = readme.indexOf(marker);
  if (start === -1) {
    fail(`README chapter ${position}: expected heading ${JSON.stringify(readmeTitle)}`);
    return '';
  }
  const rest = readme.slice(start + marker.length);
  const nextMarker = nextTitle
    ? `\n${position + 1}. **${nextTitle.replace(/^第\d+章：/, '')}**`
    : '\n## ';
  const next = rest.indexOf(nextMarker);
  return rest.slice(0, next === -1 ? undefined : next);
}

function normalizeRepoUrl(value, source) {
  return requireString(source, value).replace(/^git\+/, '').replace(/\.git$/, '').replace(/\/$/, '');
}

function repoUrlFromBook(book) {
  const repo = book.repository;
  if (typeof repo === 'string') return normalizeRepoUrl(repo, 'book-config.json repository');
  return normalizeRepoUrl(repo && repo.url, 'book-config.json repository.url');
}

function resolveDocsPath(navPath) {
  if (typeof navPath !== 'string' || !navPath.trim()) {
    fail(`navigation path: expected a non-empty string, got ${JSON.stringify(navPath)}`);
    return null;
  }
  let normalized = navPath.trim().replace(/\\/g, '/');
  if (/^[a-z][a-z0-9+.-]*:/i.test(normalized) || normalized.split('/').includes('..')) {
    fail(`navigation path ${JSON.stringify(navPath)}: URL schemes and traversal are not allowed`);
    return null;
  }
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  const relative = normalized.replace(/^\//, '');
  const candidates = relative === ''
    ? [path.join(DOCS, 'index.md')]
    : [path.join(DOCS, relative, 'index.md'), path.join(DOCS, `${relative.replace(/\/$/, '')}.md`)];
  const docsRoot = `${DOCS}${path.sep}`;
  const realDocsRoot = fs.realpathSync(DOCS);
  const realDocsPrefix = `${realDocsRoot}${path.sep}`;
  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (resolved !== DOCS && !resolved.startsWith(docsRoot)) {
      fail(`navigation path ${JSON.stringify(navPath)}: resolved outside docs`);
      return null;
    }
    if (!fs.existsSync(resolved)) continue;
    if (fs.lstatSync(resolved).isSymbolicLink()) {
      fail(`navigation path ${JSON.stringify(navPath)}: symlink targets are not allowed`);
      return null;
    }
    const real = fs.realpathSync(resolved);
    if (real !== realDocsRoot && !real.startsWith(realDocsPrefix)) {
      fail(`navigation path ${JSON.stringify(navPath)}: real path resolves outside docs`);
      return null;
    }
    return real;
  }
  fail(`navigation path ${JSON.stringify(navPath)}: target page not found under docs`);
  return null;
}

function filesRecursively(directory, matcher) {
  if (!fs.existsSync(directory)) {
    fail(`${rel(directory)}: required directory is missing`);
    return [];
  }
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...filesRecursively(file, matcher));
    else if (entry.isFile() && matcher(file)) result.push(file);
  }
  return result.sort();
}

function imageReferences(text) {
  return [...text.matchAll(/\/assets\/images\/diagrams\/([^)'"\s]+\.svg)/g)].map((match) => match[1]);
}

function validateMetadata(book, legacyYaml, pkg, docsConfig, index, nav) {
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
    const expectedPath = `/chapters/${chapter.id}/`;
    const navItem = navChapters[i] || {};
    assertEqual(`navigation chapter ${i + 1} title`, navItem.title, chapter.title);
    assertEqual(`navigation chapter ${i + 1} path`, navItem.path, expectedPath);
    const page = resolveDocsPath(navItem.path);
    if (page) assertEqual(`${rel(page)} title`, parseFrontMatter(page).data.title, chapter.title);
  }
  const readme = readText(path.join(ROOT, 'README.md'));
  assertContains('README.md', readme, pagesUrl);
  assertContains('README.md', readme, 'npm run check:metadata');
  assertContains('README.md', readme, 'npm test');
  const readmeChapterBlocks = chapters.map((chapter, i) => (
    readmeChapterBlock(readme, i + 1, chapter.title, chapters[i + 1] && chapters[i + 1].title)
  ));
  const readmeScopes = [
    { position: 2, required: ['JSON', 'YAML', 'XML', 'TOML', 'CSV'], forbidden: ['INI'] },
    { position: 5, required: ['Git', '正規表現', 'データ構造'], forbidden: ['環境変数', 'パッケージ管理'] },
  ];
  for (const scope of readmeScopes) {
    const block = readmeChapterBlocks[scope.position - 1] || '';
    for (const topic of scope.required) {
      assertContains(`README chapter ${scope.position}`, block, topic);
    }
    for (const topic of scope.forbidden) {
      if (block.includes(topic)) {
        fail(`README chapter ${scope.position}: must not contain out-of-scope topic ${JSON.stringify(topic)}`);
      }
    }
  }
}

function validateAppendixContract(book, nav, index) {
  const modules = (book.ux && book.ux.modules) || {};
  const configured = (book.structure && book.structure.appendices) || [];
  const legacy = readLegacyAppendices(path.join(ROOT, 'book-config.yaml'));
  const navAppendices = nav.appendices || [];

  assertEqual('book-config.json appendix count', configured.length, APPENDICES.length);
  assertEqual('book-config.yaml appendix count', legacy.length, APPENDICES.length);
  assertEqual('docs/_data/navigation.yml appendix count', navAppendices.length, APPENDICES.length);

  for (const [position, appendix] of APPENDICES.entries()) {
    assertEqual(`book-config.json ux.modules.${appendix.module}`, modules[appendix.module], true);
    const config = configured[position] || {};
    assertEqual(`book-config.json appendix ${appendix.id} id`, config.id, appendix.id);
    assertEqual(`book-config.json appendix ${appendix.id} path`, config.path, appendix.path);
    assertEqual(`book-config.json appendix ${appendix.id} title`, config.title, appendix.title);
    const legacyItem = legacy[position] || {};
    assertEqual(`book-config.yaml appendix ${appendix.id} path`, legacyItem.path, appendix.path);
    assertEqual(`book-config.yaml appendix ${appendix.id} title`, legacyItem.title, appendix.title);
    const navItem = navAppendices[position] || {};
    assertEqual(`navigation appendix ${appendix.id} path`, navItem.path, appendix.route);
    assertEqual(`navigation appendix ${appendix.id} title`, navItem.title, appendix.title);

    const sourcePage = path.join(ROOT, appendix.path, 'index.md');
    const docsPage = path.join(DOCS, appendix.route.slice(1), 'index.md');
    const source = parseFrontMatter(sourcePage);
    const docs = parseFrontMatter(docsPage);
    assertEqual(`${rel(sourcePage)} title`, source.data.title, appendix.title);
    assertEqual(`${rel(docsPage)} title`, docs.data.title, appendix.title);
    assertEqual(`${rel(docsPage)} layout`, docs.data.layout, 'book');
    assertEqual(`${rel(docsPage)} order`, docs.data.order, String(7 + position));
    assertEqual(`${rel(sourcePage)} layout`, source.data.layout, 'chapter');
    assertEqual(`${rel(sourcePage)} and ${rel(docsPage)} body`, source.body, docs.body);
    if (resolveDocsPath(appendix.route)) {
      assertEqual(`navigation ${appendix.id} route title`, docs.data.title, appendix.title);
    }
    assertContains('docs/index.md body', index.body, appendix.route);
  }

  const troubleshooting = parseFrontMatter(path.join(SRC, 'appendices', 'troubleshooting', 'index.md')).body;
  const flowStages = ['安全停止・証拠保全', '再現/範囲', '分類', '診断', '最小対処', '再確認/rollback/記録'];
  let previous = -1;
  for (const stage of flowStages) {
    const current = troubleshooting.indexOf(stage);
    if (current === -1) fail(`troubleshooting flow marker is missing: ${stage}`);
    else if (current <= previous) fail(`troubleshooting flow marker order is invalid: ${stage}`);
    previous = current;
  }
  for (const boundary of ['secret 露出', 'credential を失効', '意図しない更新', '本番/共有環境', '課金/権限変更']) {
    assertContains('troubleshooting safety boundary', troubleshooting, boundary);
  }
  const routes = [
    ['JSON / YAML', '/chapters/chapter02/'],
    ['shell / Python', '/chapters/chapter03/'],
    ['API の 4xx / 429 / 5xx / timeout', '/chapters/chapter04/'],
    ['Git / 差分', '/chapters/chapter05/'],
  ];
  for (const [heading, chapterRoute] of routes) {
    const start = troubleshooting.indexOf(`### ${heading}`);
    const end = troubleshooting.indexOf('\n### ', start + 1);
    const routeText = start === -1 ? '' : troubleshooting.slice(start, end === -1 ? undefined : end);
    if (start === -1) fail(`troubleshooting symptom route is missing: ${heading}`);
    for (const field of ['観測対象', 'read-only確認', '次の判断', '対処', '停止/escalation', '関連章']) {
      assertContains(`troubleshooting ${heading}`, routeText, field);
    }
    assertContains(`troubleshooting ${heading}`, routeText, chapterRoute);
  }

  const figureIndex = parseFrontMatter(path.join(SRC, 'appendices', 'figure-index', 'index.md')).body;
  assertContains('figure index mobile presentation', figureIndex, '<ol class="figure-index-list">');
  assertContains('figure index mobile presentation', figureIndex, 'overflow-wrap: anywhere');
  if (figureIndex.includes('<table')) fail('figure index must remain a vertical, mobile-accessible list instead of a wide table');
  if (figureIndex.includes('page-navigation.html')) fail('figure index must not include duplicate page navigation');
  if (troubleshooting.includes('page-navigation.html')) fail('troubleshooting must not include duplicate page navigation');
}

function validateFigureContract() {
  const expectedRefs = FIGURES.map((figure) => figure.asset);
  const expectedAssetInventory = [...expectedRefs, ...EXCLUDED_ASSETS].sort();
  const docsAssets = filesRecursively(path.join(DOCS, 'assets', 'images', 'diagrams'), (file) => file.endsWith('.svg'))
    .map((file) => path.relative(path.join(DOCS, 'assets', 'images', 'diagrams'), file).replace(/\\/g, '/'));
  assertArrayEqual('managed SVG asset inventory', docsAssets, expectedAssetInventory);

  for (const root of [SRC, DOCS]) {
    const refs = filesRecursively(root, (file) => file.endsWith('.md'))
      .flatMap((file) => imageReferences(readText(file)));
    assertArrayEqual(`${rel(root)} public SVG references`, refs, expectedRefs);
    for (const excluded of EXCLUDED_ASSETS) {
      if (refs.includes(excluded)) fail(`${rel(root)} must not reference excluded asset ${excluded}`);
    }
  }

  const indexFile = path.join(SRC, 'appendices', 'figure-index', 'index.md');
  const figureIndex = parseFrontMatter(indexFile).body;
  for (const excluded of EXCLUDED_ASSETS) {
    if (figureIndex.includes(path.basename(excluded))) fail(`figure index includes excluded asset ${excluded}`);
  }

  for (const figure of FIGURES) {
    const sourceChapter = path.join(SRC, 'chapters', figure.chapter, 'index.md');
    const docsChapter = path.join(DOCS, 'chapters', figure.chapter, 'index.md');
    const assetReference = `/assets/images/diagrams/${figure.asset}`;
    const anchorPattern = new RegExp(`<span id="${figure.anchor}"></span>\\n!\\[[^\\]]+\\]\\([^)]*${escapeRegex(assetReference)}[^)]*\\)`);
    for (const chapter of [sourceChapter, docsChapter]) {
      const chapterText = readText(chapter);
      const anchorMatches = [...chapterText.matchAll(new RegExp(`<span id="${figure.anchor}"></span>`, 'g'))];
      assertEqual(`${rel(chapter)} ${figure.anchor} count`, anchorMatches.length, 1);
      if (!anchorPattern.test(chapterText)) {
        fail(`${rel(chapter)}: ${figure.anchor} must immediately precede ${figure.asset}`);
      }
    }
    const target = `/chapters/${figure.chapter}/#${figure.anchor}`;
    assertContains('figure index direct link', figureIndex, target);
    assertContains('figure index title', figureIndex, figure.title);
  }
  const directLinks = [...figureIndex.matchAll(/href="\{\{ '([^']+#figure-[^']+)' \| relative_url \}\}"/g)].map((match) => match[1]);
  assertArrayEqual('figure index direct-link inventory', directLinks, FIGURES.map((figure) => `/chapters/${figure.chapter}/#${figure.anchor}`));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function copyFixture(destination) {
  for (const file of ['book-config.json', 'book-config.yaml', 'package.json', 'README.md']) {
    fs.copyFileSync(path.join(ROOT, file), path.join(destination, file));
  }
  fs.cpSync(SRC, path.join(destination, 'src'), { recursive: true });
  fs.cpSync(DOCS, path.join(destination, 'docs'), { recursive: true });
}

function expectFixtureFailure(name, mutate, expectedText) {
  const fixture = fs.mkdtempSync(path.join(negativeFixtureBase(), `${name}-`));
  copyFixture(fixture);
  mutate(fixture);
  try {
    childProcess.execFileSync(process.execPath, [__filename, '--root', fixture, '--skip-negative'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    fail(`negative fixture ${name}: checker unexpectedly passed`);
  } catch (error) {
    const output = `${error.stdout || ''}${error.stderr || ''}`;
    if (!output.includes(expectedText)) {
      fail(`negative fixture ${name}: expected failure containing ${JSON.stringify(expectedText)}, got ${JSON.stringify(output)}`);
    }
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

let negativeFixtureRoot = null;

function negativeFixtureBase() {
  if (negativeFixtureRoot) return negativeFixtureRoot;
  const local = path.join(ROOT, '.codex-local', 'tmp');
  fs.mkdirSync(local, { recursive: true });
  negativeFixtureRoot = fs.mkdtempSync(path.join(local, 'metadata-consistency-'));
  return negativeFixtureRoot;
}

function cleanNegativeFixtureBase() {
  if (!negativeFixtureRoot) return;
  const runRoot = negativeFixtureRoot;
  negativeFixtureRoot = null;
  fs.rmSync(runRoot, { recursive: true, force: true });
  const local = path.dirname(runRoot);
  try {
    if (fs.readdirSync(local).length === 0) fs.rmdirSync(local);
  } catch (_) {
    // The directory can be shared by a caller; an empty-directory cleanup is best effort.
  }
  const agentLocal = path.dirname(local);
  try {
    if (fs.readdirSync(agentLocal).length === 0) fs.rmdirSync(agentLocal);
  } catch (_) {
    // The directory can be shared by a caller; an empty-directory cleanup is best effort.
  }
}

function runNegativeFixtures() {
  try {
    expectFixtureFailure('missing-flag', (fixture) => {
      const file = path.join(fixture, 'book-config.json');
      const book = JSON.parse(fs.readFileSync(file, 'utf8'));
      book.ux.modules.troubleshootingFlow = false;
      fs.writeFileSync(file, `${JSON.stringify(book, null, 2)}\n`);
    }, 'ux.modules.troubleshootingFlow');
    expectFixtureFailure('missing-route', (fixture) => {
      fs.rmSync(path.join(fixture, 'docs', 'appendices', 'troubleshooting', 'index.md'));
    }, 'target page not found under docs');
    expectFixtureFailure('symlink-route', (fixture) => {
      const route = path.join(fixture, 'docs', 'appendices', 'troubleshooting', 'index.md');
      fs.rmSync(route);
      fs.symlinkSync(path.join(fixture, 'docs', 'index.md'), route);
    }, 'symlink targets are not allowed');
    expectFixtureFailure('missing-source-page', (fixture) => {
      fs.rmSync(path.join(fixture, 'src', 'appendices', 'figure-index', 'index.md'));
    }, 'cannot read file');
    expectFixtureFailure('missing-flow-marker', (fixture) => {
      const file = path.join(fixture, 'src', 'appendices', 'troubleshooting', 'index.md');
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('安全停止・証拠保全', '安全停止'));
    }, 'troubleshooting flow marker is missing');
    expectFixtureFailure('missing-anchor', (fixture) => {
      const file = path.join(fixture, 'docs', 'chapters', 'chapter01', 'index.md');
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('<span id="figure-sre-concepts"></span>\n', ''));
    }, 'figure-sre-concepts count');
    expectFixtureFailure('unreferenced-extra-asset', (fixture) => {
      fs.writeFileSync(path.join(fixture, 'docs', 'assets', 'images', 'diagrams', 'chapter01', 'unreferenced-extra.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>\n');
    }, 'managed SVG asset inventory');
    expectFixtureFailure('missing-index-inventory', (fixture) => {
      const file = path.join(fixture, 'src', 'appendices', 'figure-index', 'index.md');
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('/chapters/chapter03/#figure-script-automation-architecture', '/chapters/chapter03/#figure-missing'));
    }, 'figure index direct link');
    expectFixtureFailure('readme-chapter02-out-of-scope-topic', (fixture) => {
      const file = path.join(fixture, 'README.md');
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('XML、TOML、CSV', 'XML、INI/TOML、CSV'));
    }, 'README chapter 2: must not contain out-of-scope topic "INI"');
    expectFixtureFailure('readme-chapter05-out-of-scope-topic', (fixture) => {
      const file = path.join(fixture, 'README.md');
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('正規表現によるログ・文字列処理', '正規表現、環境変数、パッケージ管理'));
    }, 'README chapter 5: must not contain out-of-scope topic "環境変数"');
  } finally {
    cleanNegativeFixtureBase();
  }
}

const book = readJson(path.join(ROOT, 'book-config.json'));
const legacyYaml = parseTopLevelYaml(path.join(ROOT, 'book-config.yaml'));
const pkg = readJson(path.join(ROOT, 'package.json'));
const docsConfig = parseTopLevelYaml(path.join(DOCS, '_config.yml'));
const index = parseFrontMatter(path.join(DOCS, 'index.md'));
const nav = readNavigation(path.join(DOCS, '_data', 'navigation.yml'));

validateMetadata(book, legacyYaml, pkg, docsConfig, index, nav);
validateAppendixContract(book, nav, index);
validateFigureContract();

if (errors.length > 0) {
  console.error('Reader UX and metadata consistency check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (!SKIP_NEGATIVE) {
  runNegativeFixtures();
  if (errors.length > 0) {
    console.error('Reader UX negative fixture check failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
}

console.log('Reader UX and metadata consistency check passed.');
