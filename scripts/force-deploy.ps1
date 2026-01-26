# 强制重新部署到 GitHub Pages
# 解决本地构建和远程部署不一致的问题

Write-Host "🚀 开始强制重新部署到 GitHub Pages" -ForegroundColor Cyan
Write-Host ""

# 1. 检查当前分支
Write-Host "1️⃣  检查当前分支..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "   当前分支: $currentBranch" -ForegroundColor Gray

if ($currentBranch -ne "main") {
    Write-Host "   ⚠️  建议在 main 分支上执行部署" -ForegroundColor Yellow
    $continue = Read-Host "   是否继续? (y/n)"
    if ($continue -ne "y") {
        Write-Host "   已取消" -ForegroundColor Red
        exit
    }
}

# 2. 检查是否有未提交的更改
Write-Host ""
Write-Host "2️⃣  检查工作目录状态..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "   ⚠️  有未提交的更改:" -ForegroundColor Yellow
    Write-Host $status -ForegroundColor Gray
    $continue = Read-Host "   是否继续? (y/n)"
    if ($continue -ne "y") {
        Write-Host "   已取消" -ForegroundColor Red
        exit
    }
} else {
    Write-Host "   ✅ 工作目录干净" -ForegroundColor Green
}

# 3. 清理 build 目录
Write-Host ""
Write-Host "3️⃣  清理旧的构建文件..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
    Write-Host "   ✅ build 目录已清理" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  build 目录不存在" -ForegroundColor Gray
}

# 4. 生成架构数据
Write-Host ""
Write-Host "4️⃣  生成架构数据..." -ForegroundColor Yellow
try {
    npm run generate-architecture
    Write-Host "   ✅ 架构数据生成成功" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  架构数据生成失败，继续构建..." -ForegroundColor Yellow
}

# 5. 构建项目
Write-Host ""
Write-Host "5️⃣  构建项目..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "   ✅ 构建成功" -ForegroundColor Green
} catch {
    Write-Host "   ❌ 构建失败" -ForegroundColor Red
    exit 1
}

# 6. 检查构建结果
Write-Host ""
Write-Host "6️⃣  检查构建结果..." -ForegroundColor Yellow
if (Test-Path "build\index.html") {
    $indexStats = Get-Item "build\index.html"
    Write-Host "   ✅ build/index.html 存在" -ForegroundColor Green
    Write-Host "   📅 修改时间: $($indexStats.LastWriteTime)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ build/index.html 不存在" -ForegroundColor Red
    exit 1
}

# 7. 确保 .nojekyll 存在
Write-Host ""
Write-Host "7️⃣  检查 .nojekyll 文件..." -ForegroundColor Yellow
$nojekyllPath = "build\.nojekyll"
if (-not (Test-Path $nojekyllPath)) {
    "" | Out-File -FilePath $nojekyllPath -Encoding utf8
    Write-Host "   ✅ 已创建 .nojekyll 文件" -ForegroundColor Green
} else {
    Write-Host "   ✅ .nojekyll 文件已存在" -ForegroundColor Green
}

# 8. 部署到 gh-pages
Write-Host ""
Write-Host "8️⃣  部署到 gh-pages 分支..." -ForegroundColor Yellow
try {
    npm run deploy
    Write-Host "   ✅ 部署命令执行成功" -ForegroundColor Green
} catch {
    Write-Host "   ❌ 部署失败" -ForegroundColor Red
    exit 1
}

# 9. 强制推送到远程（如果需要）
Write-Host ""
Write-Host "9️⃣  检查是否需要强制推送..." -ForegroundColor Yellow
Write-Host "   💡 如果 GitHub Pages 仍然显示旧版本，可能需要强制推送" -ForegroundColor Gray
Write-Host "   ⚠️  强制推送会覆盖远程 gh-pages 分支" -ForegroundColor Yellow
$forcePush = Read-Host "   是否强制推送到远程? (y/n)"

if ($forcePush -eq "y") {
    Write-Host "   正在强制推送..." -ForegroundColor Yellow
    try {
        git push origin gh-pages --force
        Write-Host "   ✅ 强制推送成功" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ 强制推送失败" -ForegroundColor Red
    }
} else {
    Write-Host "   ⏭️  跳过强制推送" -ForegroundColor Gray
}

# 10. 完成
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📝 后续步骤:" -ForegroundColor Yellow
Write-Host "   1. 等待 5-10 分钟让 GitHub Pages 更新" -ForegroundColor Gray
Write-Host "   2. 访问 https://jsheng0722.github.io 查看结果" -ForegroundColor Gray
Write-Host "   3. 如果仍然显示旧版本，尝试:" -ForegroundColor Gray
Write-Host "      - 清除浏览器缓存 (Ctrl+F5)" -ForegroundColor Gray
Write-Host "      - 使用无痕模式访问" -ForegroundColor Gray
Write-Host "      - 检查 GitHub Pages 设置" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 GitHub Pages 设置:" -ForegroundColor Yellow
Write-Host "   https://github.com/jsheng0722/jsheng0722.github.io/settings/pages" -ForegroundColor Gray
Write-Host ""
