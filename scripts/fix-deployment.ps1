# GitHub Pages 部署修复脚本
# 用于解决部署内容不更新的问题

Write-Host "🔧 开始修复部署问题..." -ForegroundColor Cyan
Write-Host ""

# 1. 检查当前状态
Write-Host "1️⃣ 检查当前状态..." -ForegroundColor Yellow
$buildExists = Test-Path "build"
if ($buildExists) {
    Write-Host "   ✅ build 目录存在" -ForegroundColor Green
    $buildTime = (Get-Item "build").LastWriteTime
    Write-Host "   最后修改时间: $buildTime" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  build 目录不存在" -ForegroundColor Yellow
}
Write-Host ""

# 2. 清理旧的构建
Write-Host "2️⃣ 清理旧的构建..." -ForegroundColor Yellow
if ($buildExists) {
    Remove-Item -Recurse -Force "build" -ErrorAction SilentlyContinue
    Write-Host "   ✅ 已删除旧的 build 目录" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  无需清理" -ForegroundColor Gray
}
Write-Host ""

# 3. 生成架构数据
Write-Host "3️⃣ 生成架构数据..." -ForegroundColor Yellow
try {
    npm run generate-architecture
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ 架构数据生成成功" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  架构数据生成可能有问题" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ 架构数据生成失败: $_" -ForegroundColor Red
}
Write-Host ""

# 4. 重新构建
Write-Host "4️⃣ 重新构建项目..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ 构建成功" -ForegroundColor Green
        
        # 检查构建输出
        if (Test-Path "build/index.html") {
            $indexTime = (Get-Item "build/index.html").LastWriteTime
            Write-Host "   📄 index.html 修改时间: $indexTime" -ForegroundColor Gray
            
            # 检查 .nojekyll
            if (Test-Path "build/.nojekyll") {
                Write-Host "   ✅ .nojekyll 文件存在" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  .nojekyll 文件不存在，正在创建..." -ForegroundColor Yellow
                Copy-Item "public/.nojekyll" "build/.nojekyll" -ErrorAction SilentlyContinue
                if (Test-Path "build/.nojekyll") {
                    Write-Host "   ✅ .nojekyll 文件已创建" -ForegroundColor Green
                }
            }
        }
    } else {
        Write-Host "   ❌ 构建失败" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ 构建失败: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. 部署到 GitHub Pages
Write-Host "5️⃣ 部署到 GitHub Pages..." -ForegroundColor Yellow
Write-Host "   正在运行: npm run deploy" -ForegroundColor Gray
Write-Host ""
try {
    npm run deploy
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "   ✅ 部署命令执行成功" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "   ⚠️  部署命令可能有问题，请检查输出" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "   ❌ 部署失败: $_" -ForegroundColor Red
}
Write-Host ""

# 6. 总结和建议
Write-Host "📋 后续步骤:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 检查 GitHub Pages 设置:" -ForegroundColor White
Write-Host "   访问: https://github.com/jsheng0722/jsheng0722.github.io/settings/pages" -ForegroundColor Gray
Write-Host "   确认 Branch 设置为 'gh-pages'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 等待 5-10 分钟让 GitHub Pages 更新" -ForegroundColor White
Write-Host ""
Write-Host "3. 清除浏览器缓存后访问:" -ForegroundColor White
Write-Host "   https://jsheng0722.github.io" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. 如果仍然看到旧内容:" -ForegroundColor White
Write-Host "   - 尝试无痕模式访问" -ForegroundColor Gray
Write-Host "   - 检查 gh-pages 分支: git checkout gh-pages" -ForegroundColor Gray
Write-Host "   - 验证文件修改时间" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ 修复脚本执行完成！" -ForegroundColor Green
