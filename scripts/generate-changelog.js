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

  // Extract version from the first [X.Y.Z] pattern
  const versionMatch = changelogContent.match(/\[(\d+\.\d+\.\d+)\]/);
  const version = versionMatch ? versionMatch[1] : null;

  if (version) {
    // Update package.json version
    const packagePath = join(rootDir, 'package.json');
    const packageContent = readFileSync(packagePath, 'utf-8');
    const packageJson = JSON.parse(packageContent);

    if (packageJson.version !== version) {
      packageJson.version = version;
      writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
      console.log(`✓ package.json version updated to ${version}`);
    } else {
      console.log(`✓ package.json version already at ${version}`);
    }
  } else {
    console.warn('⚠ Could not extract version from CHANGELOG.md');
  }

  // Remove the first line (# Changelog header)
  const lines = changelogContent.split('\n');
  const contentWithoutTitle = lines.slice(1).join('\n').trim();

  // Generate the JS file
  const outputPath = join(rootDir, 'src', 'changelog.js');
  const jsContent = `export const changelog = \`${contentWithoutTitle}\`;
`;

  writeFileSync(outputPath, jsContent, 'utf-8');
  console.log('✓ changelog.js generated successfully');
} catch (error) {
  console.error('Error generating changelog.js:', error.message);
  process.exit(1);
}
