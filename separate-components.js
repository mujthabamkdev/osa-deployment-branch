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

function extractTemplate(content) {
  // Match template with backticks
  const match1 = content.match(/template:\s*`([^`]*)`/s);
  if (match1) return match1[1];
  
  // Match template with single quotes
  const match2 = content.match(/template:\s*'([^']*)'(?=\s*[,}])/s);
  if (match2) return match2[1];
  
  return null;
}

function extractStyles(content) {
  // Match styles with backticks
  const match1 = content.match(/styles:\s*\[\s*`([^`]*)`\s*\]/s);
  if (match1) return match1[1];
  
  // More complex styles extraction
  const match2 = content.match(/styles:\s*\[([\s\S]*?)\]\s*[,}]/m);
  if (match2) {
    let styles = match2[1];
    // Remove backticks and leading/trailing whitespace
    styles = styles.replace(/^\s*`/, '').replace(/`\s*,?$/, '');
    if (styles.trim()) return styles;
  }
  
  return null;
}

function removeTemplateAndStyles(content, template, styles) {
  let result = content;
  
  if (template) {
    // Remove template from decorator
    result = result.replace(/template:\s*`[^`]*`/s, '');
    result = result.replace(/template:\s*'[^']*'/s, '');
  }
  
  if (styles) {
    // Remove styles from decorator
    result = result.replace(/styles:\s*\[[\s\S]*?\]/s, '');
  }
  
  // Clean up any double commas or trailing commas
  result = result.replace(/,\s*,/g, ',');
  result = result.replace(/,(\s*[}\]])/g, '$1');
  
  return result;
}

const components = findComponentFiles(path.join(FRONTEND_DIR, 'src'));
console.log(`\n📊 Found ${components.length} component files\n`);

let processed = 0;
let skipped = 0;

for (const componentFile of components) {
  const content = fs.readFileSync(componentFile, 'utf-8');
  const dir = path.dirname(componentFile);
  const baseName = path.basename(componentFile).replace('.component.ts', '');
  const htmlFile = path.join(dir, `${baseName}.component.html`);
  const cssFile = path.join(dir, `${baseName}.component.css`);
  
  // Skip if already using templateUrl or styleUrl
  if (content.includes('templateUrl') || content.includes('styleUrl')) {
    console.log(`⊘ ${baseName}.component.ts (already using external files)`);
    skipped++;
    continue;
  }
  
  const template = extractTemplate(content);
  const styles = extractStyles(content);
  
  if (!template && !styles) {
    console.log(`⊘ ${baseName}.component.ts (no template or styles)`);
    skipped++;
    continue;
  }
  
  console.log(`📦 Processing ${baseName}.component.ts`);
  
  if (template) {
    fs.writeFileSync(htmlFile, template, 'utf-8');
    console.log(`   ✓ Created ${baseName}.component.html (${template.length} bytes)`);
  }
  
  if (styles) {
    fs.writeFileSync(cssFile, styles, 'utf-8');
    console.log(`   ✓ Created ${baseName}.component.css (${styles.length} bytes)`);
  }
  
  processed++;
}

console.log(`\n✅ Completed!`);
console.log(`   Processed: ${processed} components`);
console.log(`   Skipped: ${skipped} components\n`);
