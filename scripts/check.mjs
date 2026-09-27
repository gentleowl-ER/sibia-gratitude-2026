import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const context = vm.createContext({window:{}});
vm.runInContext(read('site/catalog.js'), context);
const awards = context.window.SIBIA_AWARDS;
assert.equal(awards.length, 16, 'All 16 award categories must be present.');
assert.equal(new Set(awards.map(a=>a.id)).size, 16, 'Award identifiers must be unique.');
for (const award of awards) {
  for (const key of ['id','code','name','group','audience','prize','amount','forms','paper','note','source']) {
    assert.ok(typeof award[key] === 'string' && award[key].length > 0, `${award.id}: missing ${key}`);
  }
}
const html = read('site/index.html');
for (const id of ['main','award-grid','search','selection','count','clear','award-dialog','close-dialog','detail']) {
  assert.ok(html.includes(`id="${id}"`), `Missing interface element ${id}`);
}
for (const match of html.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g)) {
  assert.ok(existsSync(new URL('site/'+match[1], root)), `Missing local asset ${match[1]}`);
}
assert.ok(!/<input[^>]*(?:name|type)="(?:email|password|file)"/i.test(html), 'Public landing page must not collect personal data.');
assert.match(html, /2026 年採線上試辦：取消紙本寄送/);
assert.match(html, /2026 年 11 月 1–30 日/);
assert.match(html, /線上投稿已依主辦者指示正式開放/);
assert.match(read('site/app.js'), /url\.searchParams\.set\('awards'/);
assert.match(read('site/style.css'), /prefers-reduced-motion/);
for (const name of readdirSync(new URL('site/',root))) {
  if (!/\.(?:html|js|css)$/.test(name)) continue;
  const text = read('site/'+name);
  assert.ok(!/ROOT_FOLDER_ID|SPREADSHEET_ID|DEPLOYMENT_TARGET_|prof_[a-z0-9]+|genteowls@gmail\.com|github_pat_|-----BEGIN PRIVATE KEY-----/.test(text), `Unexpected private implementation data in ${name}`);
}
console.log('Validated: 16 complete awards, public links and assets, page controls, reduced-motion support, and no private storage configuration.');
