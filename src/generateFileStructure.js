const fs = require('fs');
const path = require('path');

const getFileStructure = (dir, basePath = '') => {
  const structure = [];                             // 创建结构
  const items = fs.readdirSync(dir);                // 读取文件夹
  
  items.forEach(item => {                           // 遍历文件
    const fullPath = path.join(dir, item);
    const relativePath = path.join(basePath, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      structure.push({
        type: 'folder',
        name: item,
        path: relativePath,
        children: getFileStructure(fullPath, relativePath)
      });
    } else {
      structure.push({
        type: 'file',
        name: item,
        path: relativePath
      });
    }
  });

  return structure;
};

const publicDir = path.join(__dirname, '../public/home/product');
const fileStructure = getFileStructure(publicDir);
fs.writeFileSync(path.join(__dirname, '../public/home/fileStructure.json'), JSON.stringify(fileStructure, null, 2));

console.log('File structure generated.');
