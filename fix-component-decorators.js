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
console.log(`\n🔧 Fixing component decorators...\n`);

let fixed = 0;

for (const componentFile of components) {
  let content = fs.readFileSync(componentFile, 'utf-8');
  const baseName = path.basename(componentFile).replace('.component.ts', '');
  const dir = path.dirname(componentFile);
  
  // Check what files exist
  const htmlFile = path.join(dir, `${baseName}.component.html`);
  const cssFile = path.join(dir, `${baseName}.component.css`);
  const hasHtml = fs.existsSync(htmlFile);
  const hasCss = fs.existsSync(cssFile);
  
  if (!hasHtml && !hasCss) {
    continue;
  }
  
  const originalContent = content;
  let modified = false;
  
  // Fix decorator - ensure proper format
  // Match the @Component decorator
  const componentDecoratorRegex = /@Component\(\s*\{[\s\S]*?\}\s*\)/;
  const decoratorMatch = content.match(componentDecoratorRegex);
  
  if (decoratorMatch) {
    let decorator = decoratorMatch[0];
    let newDecorator = decorator;
    
    // Fix formatting and add missing urls
    if (hasHtml && !decorator.includes('templateUrl')) {
      newDecorator = newDecorator.replace(/\{/, `{\n  templateUrl: './${baseName}.component.html',`);
    }
    
    if (hasCss && !decorator.includes('styleUrl')) {
      newDecorator = newDecorator.replace(/\{/, `{\n  styleUrl: './${baseName}.component.css',`);
    }
    
    // Clean up formatting
    newDecorator = newDecorator.replace(/\},\s*selector/, `},\n  selector`);
    newDecorator = newDecorator.replace(/\},\n\s*templateUrl/, `},\n  templateUrl`);
    
    if (newDecorator !== decorator) {
      content = content.replace(decoratorMatch[0], newDecorator);
      modified = true;
    }
  }
  
  // Alternative: if the above didn't work, try a different approach
  if (!modified && hasHtml) {
    // Check if already has templateUrl
    if (!content.includes('templateUrl')) {
      // Find @Component and add templateUrl
      content = content.replace(
        /@Component\(\s*\{/,
        `@Component({\n  templateUrl: './${baseName}.component.html',`
      );
      modified = true;
    }
  }
  
  if (!modified && hasCss) {
    // Check if already has styleUrl
    if (!content.includes('styleUrl')) {
      // Find the closing of @Component and add styleUrl before it
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('})') && lines[i - 1] && !lines[i - 1].includes('styleUrl')) {
          lines.splice(i, 0, `  styleUrl: './${baseName}.component.css',`);
          content = lines.join('\n');
          modified = true;
          break;
        }
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(componentFile, content, 'utf-8');
    console.log(`✓ Fixed ${baseName}.component.ts`);
    fixed++;
  }
}

console.log(`\n✅ Fixed ${fixed} component decorators!\n`);
