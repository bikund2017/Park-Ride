#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const SKIP_DIRS = ['node_modules', 'dist', 'build', '.git', '.next', 'coverage'];
const SKIP_FILES = ['remove-comments.js', 'remove-comments.sh'];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const stats = {
  jsFiles: 0,
  cssFiles: 0,
  totalFiles: 0,
  errors: 0
};

function removeJSComments(content) {
  // Remove single-line comments (// ...)
  content = content.replace(/\/\/.*$/gm, '');
  
  // Remove multi-line comments (/* ... */)
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove empty lines (multiple consecutive newlines)
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return content;
}

/**
 * Remove comments from CSS files
 */
function removeCSSComments(content) {
  // Remove CSS comments (/* ... */)
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove empty lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return content;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath);
    
    // Skip certain files
    if (SKIP_FILES.includes(fileName)) {
      return;
    }
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent;
    
    // Process based on file type
    if (ext === '.js' || ext === '.jsx') {
      newContent = removeJSComments(content);
      stats.jsFiles++;
    } else if (ext === '.css') {
      newContent = removeCSSComments(content);
      stats.cssFiles++;
    } else {
      return; // Skip unsupported file types
    }
    
    // Only process if content changed
    if (newContent !== content) {
      // Create backup
      fs.writeFileSync(filePath + '.bak', content, 'utf8');
      
      // Write new content
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      console.log(`${colors.green}✓${colors.reset} Processed: ${filePath}`);
      stats.totalFiles++;
    }
    
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Error processing ${filePath}: ${error.message}`);
    stats.errors++;
  }
}

/**
 * Recursively walk directory
 */
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (!SKIP_DIRS.includes(file)) {
        walkDirectory(filePath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (['.js', '.jsx', '.css'].includes(ext)) {
        processFile(filePath);
      }
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.yellow}🧹 Starting comment removal from code files...${colors.reset}\n`);
  
  const startTime = Date.now();
  const projectRoot = process.cwd();
  
  try {
    walkDirectory(projectRoot);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n${colors.green}✅ Comment removal complete!${colors.reset}`);
    console.log(`   JavaScript/JSX files: ${stats.jsFiles}`);
    console.log(`   CSS files: ${stats.cssFiles}`);
    console.log(`   Total files processed: ${stats.totalFiles}`);
    console.log(`   Errors: ${stats.errors}`);
    console.log(`   Time taken: ${duration}s\n`);
    
    if (stats.totalFiles > 0) {
      console.log(`${colors.yellow}📦 Backup files created with .bak extension${colors.reset}`);
      console.log(`${colors.cyan}💡 To restore all backups:${colors.reset}`);
      console.log(`   find . -name "*.bak" -exec bash -c 'mv "$0" "\${0%.bak}"' {} \\;\n`);
      console.log(`${colors.cyan}💡 To remove all backups:${colors.reset}`);
      console.log(`   find . -name "*.bak" -delete\n`);
    }
    
    console.log(`${colors.red}⚠️  Review the changes before committing!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the script
main();
