const fs = require('fs');
const path = require('path');

const getLanguageContent = (dir, basePath = '') => {
  const structure = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        structure.push({
          type: 'folder',
          name: item.charAt(0).toUpperCase() + item.slice(1), // 首字母大写
          path: relativePath,
          children: getLanguageContent(fullPath, relativePath)
        });
      } else {
        structure.push({
          type: 'file',
          name: item,
          path: relativePath
        });
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return structure;
};

const languageDir = path.join(__dirname, 'pages/Note/Layout/Main/Language');
const languageContent = getLanguageContent(languageDir);

// 保存到 content 目录
const outputPath = path.join(__dirname, 'content/languageContent.json');
fs.writeFileSync(outputPath, JSON.stringify(languageContent, null, 2));

console.log('Language Content generated.');
console.log('Generated structure:', JSON.stringify(languageContent, null, 2));
