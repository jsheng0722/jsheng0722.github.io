#!/bin/bash

# GitHub Pages 部署修复脚本
# 用于解决部署内容不更新的问题

echo "🔧 开始修复部署问题..."
echo ""

# 1. 检查当前状态
echo "1️⃣ 检查当前状态..."
if [ -d "build" ]; then
    echo "   ✅ build 目录存在"
    echo "   最后修改时间: $(stat -f "%Sm" build 2>/dev/null || stat -c "%y" build 2>/dev/null)"
else
    echo "   ⚠️  build 目录不存在"
fi
echo ""

# 2. 清理旧的构建
echo "2️⃣ 清理旧的构建..."
if [ -d "build" ]; then
    rm -rf build
    echo "   ✅ 已删除旧的 build 目录"
else
    echo "   ℹ️  无需清理"
fi
echo ""

# 3. 生成架构数据
echo "3️⃣ 生成架构数据..."
if npm run generate-architecture; then
    echo "   ✅ 架构数据生成成功"
else
    echo "   ⚠️  架构数据生成可能有问题"
fi
echo ""

# 4. 重新构建
echo "4️⃣ 重新构建项目..."
if npm run build; then
    echo "   ✅ 构建成功"
    
    # 检查构建输出
    if [ -f "build/index.html" ]; then
        echo "   📄 index.html 修改时间: $(stat -f "%Sm" build/index.html 2>/dev/null || stat -c "%y" build/index.html 2>/dev/null)"
        
        # 检查 .nojekyll
        if [ -f "build/.nojekyll" ]; then
            echo "   ✅ .nojekyll 文件存在"
        else
            echo "   ⚠️  .nojekyll 文件不存在，正在创建..."
            if [ -f "public/.nojekyll" ]; then
                cp public/.nojekyll build/.nojekyll
                echo "   ✅ .nojekyll 文件已创建"
            fi
        fi
    fi
else
    echo "   ❌ 构建失败"
    exit 1
fi
echo ""

# 5. 部署到 GitHub Pages
echo "5️⃣ 部署到 GitHub Pages..."
echo "   正在运行: npm run deploy"
echo ""
if npm run deploy; then
    echo ""
    echo "   ✅ 部署命令执行成功"
else
    echo ""
    echo "   ⚠️  部署命令可能有问题，请检查输出"
fi
echo ""

# 6. 总结和建议
echo "📋 后续步骤:"
echo ""
echo "1. 检查 GitHub Pages 设置:"
echo "   访问: https://github.com/jsheng0722/jsheng0722.github.io/settings/pages"
echo "   确认 Branch 设置为 'gh-pages'"
echo ""
echo "2. 等待 5-10 分钟让 GitHub Pages 更新"
echo ""
echo "3. 清除浏览器缓存后访问:"
echo "   https://jsheng0722.github.io"
echo ""
echo "4. 如果仍然看到旧内容:"
echo "   - 尝试无痕模式访问"
echo "   - 检查 gh-pages 分支: git checkout gh-pages"
echo "   - 验证文件修改时间"
echo ""

echo "✅ 修复脚本执行完成！"
