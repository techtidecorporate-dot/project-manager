import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const colorReplacements = [
    { old: /#fa2742/g, new: '#453abc' },
    { old: /#373833/g, new: '#191a23' },
    { old: /#e8eae3/g, new: '#ffffff' }
];

function updateFilesInDirectory(dir) {
    const files = fs.readdirSync(dir);
    let updateCount = 0;

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            updateCount += updateFilesInDirectory(filePath);
        } else if (file.endsWith('.jsx') && dir.includes('dashboards')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let originalContent = content;

            colorReplacements.forEach(replacement => {
                content = content.replace(replacement.old, replacement.new);
            });

            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✓ Updated: ${filePath.replace(/.*dashboards/, 'dashboards')}`);
                updateCount++;
            }
        }
    });

    return updateCount;
}

const dashboardDir = path.join(__dirname, 'src', 'pages', 'dashboards');
console.log('Starting color updates in dashboard components...\n');
const updated = updateFilesInDirectory(dashboardDir);
console.log(`\n✓ Successfully updated ${updated} files with new color scheme!`);
