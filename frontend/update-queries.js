const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'src/features');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.queries.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace import
      content = content.replace(/import\s*{\s*(\w+)Api\s*}\s*from\s*['"]\.\/.*\.api['"];?/g, 'import * as api from "@/lib/api/services.api";');
      
      // Replace API calls: authApi.login -> api.login
      content = content.replace(/(\w+)Api\.(\w+)/g, 'api.$2');
      
      fs.writeFileSync(fullPath, content);
      console.log(`Updated ${fullPath}`);
    }
  }
}

processDir(featuresDir);
