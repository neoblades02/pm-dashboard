/**
 * ESLint Error Fixing Script
 * 
 * This script helps fix common ESLint errors automatically:
 * 1. Removes unused imports using regex
 * 2. Fixes TypeScript 'any' types with 'unknown' (for error cases) or proper types
 * 3. Fixes unescaped apostrophes in JSX
 * 
 * Run with: node fix-lint.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get list of errors from ESLint
const getLintErrors = () => {
  try {
    const result = execSync('npx eslint --format json .').toString();
    return JSON.parse(result);
  } catch (error) {
    // ESLint returns non-zero exit code when it finds errors
    return JSON.parse(error.stdout.toString());
  }
};

// Fix unused imports
const fixUnusedImports = (filePath, fileContent) => {
  // Get list of unused variables from ESLint output
  const unusedVars = [];
  
  const lintErrors = getLintErrors();
  const fileErrors = lintErrors.find(file => file.filePath === filePath)?.messages || [];
  
  fileErrors.forEach(error => {
    if (error.ruleId === '@typescript-eslint/no-unused-vars') {
      unusedVars.push(error.message.split("'")[1]);
    }
  });
  
  if (unusedVars.length === 0) return fileContent;
  
  let newContent = fileContent;
  
  // Remove unused imports
  unusedVars.forEach(varName => {
    // Simple case: import { X } from "module";
    const singleImportRegex = new RegExp(`import\\s+{\\s*${varName}\\s*}\\s+from\\s+['"].*?['"];?`, 'g');
    
    // Multiple imports: import { X, Y, Z } from "module";
    const multipleImportRegex = new RegExp(`import\\s+{\\s*(.*)${varName}(.*?)\\s*}\\s+from\\s+['"].*?['"];?`, 'g');
    
    if (singleImportRegex.test(newContent)) {
      newContent = newContent.replace(singleImportRegex, '');
    } else {
      newContent = newContent.replace(multipleImportRegex, (match, before, after) => {
        // Clean up the imports
        const imports = [...before.split(','), ...after.split(',')]
          .map(i => i.trim())
          .filter(i => i && i !== varName)
          .join(', ');
          
        if (!imports) return '';
        return `import { ${imports} } from "module";`;
      });
    }
  });
  
  return newContent;
};

// Fix TypeScript 'any' types
const fixAnyTypes = (filePath, fileContent) => {
  // Replace error catch blocks
  const catchAnyRegex = /catch\s*\(\s*error\s*:\s*any\s*\)\s*{/g;
  let newContent = fileContent.replace(catchAnyRegex, 'catch (error: unknown) {');
  
  // Replace error.message with type checking
  const errorMessageRegex = /error\.message/g;
  newContent = newContent.replace(
    errorMessageRegex, 
    '(error instanceof Error ? error.message : String(error))'
  );
  
  return newContent;
};

// Fix unescaped apostrophes
const fixUnescapedApostrophes = (filePath, fileContent) => {
  // Only fix JSX/TSX files
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.tsx')) {
    return fileContent;
  }
  
  return fileContent.replace(/'(?=\w)/g, '&apos;');
};

// Main function
const main = () => {
  console.log('Starting ESLint error fixing script...');
  
  const lintErrors = getLintErrors();
  const filesToFix = [...new Set(lintErrors.map(file => file.filePath))];
  
  console.log(`Found ${filesToFix.length} files with ESLint issues to fix.`);
  
  let fixedCount = 0;
  
  filesToFix.forEach(filePath => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      let newContent = fileContent;
      newContent = fixUnusedImports(filePath, newContent);
      newContent = fixAnyTypes(filePath, newContent);
      newContent = fixUnescapedApostrophes(filePath, newContent);
      
      if (newContent !== fileContent) {
        fs.writeFileSync(filePath, newContent);
        fixedCount++;
        console.log(`✅ Fixed issues in ${path.relative(process.cwd(), filePath)}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error);
    }
  });
  
  console.log(`\nFixed issues in ${fixedCount} files.`);
  console.log('Run "npm run lint" again to see remaining issues.');
};

main(); 