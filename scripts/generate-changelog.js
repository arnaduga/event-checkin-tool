import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

try {
  // Read CHANGELOG.md
  const changelogPath = join(rootDir, 'CHANGELOG.md');
  const changelogContent = readFileSync(changelogPath, 'utf-8');

  // Remove the first line (# Changelog header)
  const lines = changelogContent.split('\n');
  const contentWithoutTitle = lines.slice(1).join('\n').trim();

  // Generate the JS file
  const outputPath = join(rootDir, 'src', 'changelog.js');
  const jsContent = `export const changelog = \`${contentWithoutTitle}\`;\n`;

  writeFileSync(outputPath, jsContent, 'utf-8');
  console.log('✓ changelog.js generated successfully');
} catch (error) {
  console.error('Error generating changelog.js:', error.message);
  process.exit(1);
}
