import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const swaps = [
  { file: 'src/components/timeline/ChapterBookmark.vue', style: 'scripts/styles/chapter-bookmark.txt' },
  { file: 'src/components/timeline/Timeline.vue',         style: 'scripts/styles/timeline.txt' },
  { file: 'src/components/detail/MeetingDetailCard.vue', style: 'scripts/styles/meeting-detail.txt' },
  { file: 'src/views/LandingView.vue',                   style: 'scripts/styles/landing.txt' },
  { file: 'src/views/PhaseSelectView.vue',               style: 'scripts/styles/phase-select.txt' },
];

for (const { file, style } of swaps) {
  const filePath = resolve(root, file);
  const stylePath = resolve(root, style);
  const content = readFileSync(filePath, 'utf8');
  const newStyle = readFileSync(stylePath, 'utf8');
  const re = /<style scoped>[\s\S]*?<\/style>/;
  if (!re.test(content)) {
    console.log('SKIP no match', file);
    continue;
  }
  const updated = content.replace(re, newStyle);
  writeFileSync(filePath, updated, 'utf8');
  console.log('OK', file, '->', updated.length, 'bytes');
}
