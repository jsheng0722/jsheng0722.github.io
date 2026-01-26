const fs = require('fs');
const path = require('path');

/**
 * 动态生成项目架构数据
 * 扫描项目结构并生成JSON文件供前端使用
 */

const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'public', 'data', 'architecture.json');

// 图标映射
const iconMap = {
  // 路由图标
  'Home': 'FaHome',
  'Note': 'FaStickyNote',
  'Music': 'FaMusic',
  'Folder': 'FaFolder',
  'Desktop': 'FaDesktop',
  'Blog': 'FaBlog',
  'Video': 'FaVideo',
  'Shop': 'FaShoppingCart',
  'Code': 'FaCode',
  'Image': 'FaImage',
  'Eye': 'FaEye',
  'Edit': 'FaEdit',
  'FileAlt': 'FaFileAlt',
  'ChartLine': 'FaChartLine',
  'LayerGroup': 'FaLayerGroup',
  'Palette': 'FaPalette',
  'Cog': 'FaCog',
  'Database': 'FaDatabase',
};

// 颜色方案
const colors = {
  root: '#3b82f6',
  routes: '#8b5cf6',
  components: '#10b981',
  tools: '#f59e0b',
  context: '#ec4899',
  deployment: '#6b7280',
  file: '#60a5fa',
  componentFile: '#34d399',
};

/**
 * 递归扫描目录
 */
function scanDirectory(dir, basePath = '', maxDepth = 5, currentDepth = 0) {
  if (currentDepth >= maxDepth) return [];
  
  const items = [];
  if (!fs.existsSync(dir)) return items;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    // 跳过隐藏文件和特定目录
    if (entry.name.startsWith('.') || 
        entry.name === 'node_modules' || 
        entry.name === 'build' ||
        entry.name === '__tests__' ||
        entry.name === '__mocks__') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    
    if (entry.isDirectory()) {
      const children = scanDirectory(fullPath, relativePath, maxDepth, currentDepth + 1);
      items.push({
        name: entry.name,
        type: 'folder',
        path: relativePath,
        children: children,
      });
    } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.test.js')) {
      items.push({
        name: entry.name,
        type: 'file',
        path: relativePath,
      });
    }
  }
  
  return items;
}

/**
 * 解析App.js获取路由信息
 */
function parseRoutes() {
  const appJsPath = path.join(SRC_DIR, 'App.js');
  if (!fs.existsSync(appJsPath)) return [];

  const content = fs.readFileSync(appJsPath, 'utf-8');
  const routes = [];
  
  // 匹配 Route 组件 - 支持多种格式
  const routePatterns = [
    /<Route\s+path=["']([^"']+)["']\s+element=\{<(\w+)\s*\/?>\}\s*\/>/g,
    /<Route\s+path=["']([^"']+)["']\s+element=\{<(\w+)\s*\/>\}/g,
  ];
  
  for (const regex of routePatterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const [, routePath, componentName] = match;
      // 避免重复
      if (!routes.find(r => r.path === routePath)) {
        routes.push({
          path: routePath,
          component: componentName,
        });
      }
    }
  }
  
  return routes;
}

/**
 * 获取图标名称
 */
function getIconName(name) {
  if (!name) return 'FaFileAlt';
  
  // 尝试从名称中提取关键词
  const keywordMap = {
    'Home': 'FaHome',
    'Note': 'FaStickyNote',
    'Music': 'FaMusic',
    'Folder': 'FaFolder',
    'Desktop': 'FaDesktop',
    'Blog': 'FaBlog',
    'Video': 'FaVideo',
    'Shop': 'FaShoppingCart',
    'Code': 'FaCode',
    'Image': 'FaImage',
    'Eye': 'FaEye',
    'View': 'FaEye',
    'Edit': 'FaEdit',
    'Editor': 'FaEdit',
    'File': 'FaFileAlt',
    'Chart': 'FaChartLine',
    'Visualization': 'FaChartLine',
    'Layer': 'FaLayerGroup',
    'Layout': 'FaLayerGroup',
    'Palette': 'FaPalette',
    'UI': 'FaPalette',
    'Cog': 'FaCog',
    'Config': 'FaCog',
    'Database': 'FaDatabase',
    'Context': 'FaDatabase',
    'Portfolio': 'FaImage',
    'Product': 'FaImage',
    'Weather': 'FaCog',
    'Calendar': 'FaCog',
    'Algorithm': 'FaCode',
    'Diagram': 'FaCode',
  };
  
  for (const [keyword, icon] of Object.entries(keywordMap)) {
    if (name.includes(keyword)) {
      return icon;
    }
  }
  
  return 'FaFileAlt';
}

/**
 * 生成架构数据
 */
function generateArchitecture() {
  console.log('🔍 开始扫描项目结构...');
  
  // 1. 解析路由
  const routes = parseRoutes();
  console.log(`✅ 发现 ${routes.length} 个路由`);
  
  // 2. 扫描组件目录
  const componentsDir = path.join(SRC_DIR, 'components');
  const components = scanDirectory(componentsDir, 'components');
  console.log(`✅ 扫描组件目录完成`);
  
  // 3. 扫描页面目录
  const pagesDir = path.join(SRC_DIR, 'pages');
  const pages = scanDirectory(pagesDir, 'pages');
  console.log(`✅ 扫描页面目录完成`);
  
  // 4. 扫描上下文
  const contextDir = path.join(SRC_DIR, 'context');
  const contexts = scanDirectory(contextDir, 'context');
  console.log(`✅ 扫描上下文目录完成`);
  
  // 5. 扫描工具函数
  const utilsDir = path.join(SRC_DIR, 'utils');
  const utils = scanDirectory(utilsDir, 'utils');
  console.log(`✅ 扫描工具函数目录完成`);
  
  // 构建架构数据
  const architecture = {
    routes: routes.map(route => ({
      path: route.path,
      component: route.component,
      icon: getIconName(route.component),
    })),
    components: components,
    pages: pages,
    contexts: contexts,
    utils: utils,
    generatedAt: new Date().toISOString(),
  };
  
  // 确保输出目录存在
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 写入JSON文件
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(architecture, null, 2), 'utf-8');
  console.log(`✅ 架构数据已生成: ${OUTPUT_FILE}`);
  console.log(`📊 统计: ${routes.length} 路由, ${components.length} 组件分类, ${pages.length} 页面分类`);
  
  return architecture;
}

// 执行生成
if (require.main === module) {
  try {
    generateArchitecture();
    console.log('✨ 架构数据生成完成！');
  } catch (error) {
    console.error('❌ 生成架构数据时出错:', error);
    process.exit(1);
  }
}

module.exports = { generateArchitecture };
