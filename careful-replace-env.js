import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Only replace full import.meta.env references to avoid partial replacements
  content = content.replace(
    /import\.meta\.env\.VITE_SUPABASE_URL/g, 
    "'https://quqzfvucxdvlqvnjnwkn.supabase.co'"
  );
  
  content = content.replace(
    /import\.meta\.env\.VITE_SUPABASE_ANON_KEY/g, 
    "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cXpmdnVjeGR2bHF2bmpud2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMDk4OTEsImV4cCI6MjA1Nzg4NTg5MX0.VHJQ_esE8FwJ54eeg_nUelxvB4Sy9vctnouVaThQip0'"
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

console.log('Environment variable replacement complete.');