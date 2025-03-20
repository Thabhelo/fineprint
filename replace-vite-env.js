import fs from 'fs';
import path from 'path';

const VITE_SUPABASE_URL = 'https://quqzfvucxdvlqvnjnwkn.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cXpmdnVjeGR2bHF2bmpud2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMDk4OTEsImV4cCI6MjA1Nzg4NTg5MX0.VHJQ_esE8FwJ54eeg_nUelxvB4Sy9vctnouVaThQip0';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(
    /import\.meta\.env\.VITE_SUPABASE_URL/g, 
    `'${VITE_SUPABASE_URL}'`
  );
  
  content = content.replace(
    /import\.meta\.env\.VITE_SUPABASE_ANON_KEY/g, 
    `'${VITE_SUPABASE_ANON_KEY}'`
  );
  
  // Additional Vite-specific environment variable replacements
  content = content.replace(
    /process\.env\.VITE_SUPABASE_URL/g, 
    `'${VITE_SUPABASE_URL}'`
  );
  
  content = content.replace(
    /process\.env\.VITE_SUPABASE_ANON_KEY/g, 
    `'${VITE_SUPABASE_ANON_KEY}'`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed: ${filePath}`);
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && 
        file !== 'node_modules' && 
        file !== '.git') {
      traverseDirectory(fullPath);
    } else if (stat.isFile() && 
               (file.endsWith('.ts') || 
                file.endsWith('.tsx') || 
                file.endsWith('.js') || 
                file.endsWith('.jsx'))) {
      replaceInFile(fullPath);
    }
  });
}

// Start from the current directory
traverseDirectory(process.cwd());

console.log('Vite environment variable replacement complete.');