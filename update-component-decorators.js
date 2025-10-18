const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = '/Users/mujthabamk/Desktop/real-world-projects/osa/OSA/osa-frontend';

function findComponentFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(findComponentFiles(fullPath));
    } else if (item.endsWith('.component.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const components = findComponentFiles(path.join(FRONTEND_DIR, 'src'));
console.log(`\n🔄 Updating component TypeScript files...\n`);

let updated = 0;

for (const componentFile of components) {
  let content = fs.readFileSync(componentFile, 'utf-8');
  const baseName = path.basename(componentFile).replace('.component.ts', '');
  const dir = path.dirname(componentFile);
  
  // Check if HTML file exists
  const htmlFile = path.join(dir, `${baseName}.component.html`);
  const cssFile = path.join(dir, `${baseName}.component.css`);
  const hasHtml = fs.existsSync(htmlFile);
  const hasCss = fs.existsSync(cssFile);
  
  if (!hasHtml && !hasCss) {
    continue;
  }
  
  let originalContent = content;
  
  // Replace template with templateUrl
  if (hasHtml) {
    // Remove inline template
    content = content.replace(/template:\s*`[^`]*`\s*,?\s*/s, '');
    content = content.replace(/template:\s*'[^']*'\s*,?\s*/s, '');
    
    // Add templateUrl before styles or closing decorator
    const templateUrlLine = `  templateUrl: './${baseName}.component.html',`;
    
    // Insert after @Component(
    if (!content.includes('templateUrl')) {
      const componentMatch = content.match(/@Component\(\s*\{/);
      if (componentMatch) {
        const insertPos = componentMatch.index + componentMatch[0].length;
        content = content.slice(0, insertPos) + '\n' + templateUrlLine + content.slice(insertPos);
      }
    }
  }
  
  // Replace styles with styleUrl
  if (hasCss) {
    // Remove inline styles
    content = content.replace(/styles:\s*\[[\s\S]*?\]\s*,?\s*/m, '');
    
    // Add styleUrl
    const styleUrlLine = `  styleUrl: './${baseName}.component.css',`;
    
    // Insert before closing decorator
    if (!content.includes('styleUrl')) {
      const endMatch = content.match(/\n\}\)\s*export/);
      if (endMatch) {
        const insertPos = endMatch.index;
        content = content.slice(0, insertPos) + '\n' + styleUrlLine + content.slice(insertPos);
      }
    }
  }
  
  // Clean up double commas
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/,(\s*\n\s*\})/g, '$1');
  
  if (content !== originalContent) {
    fs.writeFileSync(componentFile, content, 'utf-8');
    console.log(`✓ Updated ${baseName}.component.ts`);
    updated++;
  }
}

console.log(`\n✅ Updated ${updated} component files!\n`);
