import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import { Navigation, FileList } from '../../components/UI';
import directoryData from '../../content/languageContent.json';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';

function Home() {
    const [sidebarContent, setSidebarContent] = useState('');
    const [currentFileContent, setCurrentFileContent] = useState('');
    const contentRef = useRef(null);

    useEffect(() => {
        if (!currentFileContent) return;
        // Bind copy events within the rendered content
        const root = contentRef.current;
        if (!root) return;
        const buttons = root.querySelectorAll('.included-code-block .copy-code-btn');
        const handlers = [];
        buttons.forEach(btn => {
            const handler = () => {
                const pre = btn.parentElement?.nextElementSibling;
                const codeEl = pre?.querySelector('code');
                const text = codeEl?.textContent || '';
                if (!text) return;
                navigator.clipboard.writeText(text).then(() => {
                    const original = btn.textContent;
                    btn.textContent = 'Copied!';
                    setTimeout(() => (btn.textContent = original || 'Copy'), 1200);
                }).catch(() => {
                    btn.textContent = 'Failed';
                    setTimeout(() => (btn.textContent = 'Copy'), 1200);
                });
            };
            btn.addEventListener('click', handler);
            handlers.push({ btn, handler });
        });
        try { Prism.highlightAllUnder(root); } catch (e) {}
        return () => {
            // cleanup listeners on content change
            handlers.forEach(({ btn, handler }) => btn.removeEventListener('click', handler));
        };
    }, [currentFileContent]);


    const handleNavigationClick = (content) => {
        setSidebarContent(content);
        setCurrentFileContent(''); // 清空当前文件内容，重置为默认状态
    };

    const handleFileClick = (filePath) => {
        // 从 Language 文件夹加载文件
        const correctedPath = filePath.replace(/\\/g, '/');

        // 直接从 src/pages/Note/Layout/Main/Language 读取文件
        // 由于是在浏览器环境，我们需要将文件复制到 public 目录
        const fullPath = `/language/${correctedPath}`;

        fetch(fullPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(async (htmlContent) => {
            // 解析并处理 <code-include> 标签
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const includeNodes = Array.from(doc.querySelectorAll('code-include'));

            const baseDir = correctedPath.split('/').slice(0, -1).join('/');

            for (const node of includeNodes) {
                const src = node.getAttribute('src');
                const lang = node.getAttribute('lang') || '';
                if (src) {
                    try {
                        // 代码文件相对到文章所在目录
                        const codePath = `/language/${baseDir}/${src}`;
                        const res = await fetch(codePath);
                        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                        const codeText = await res.text();
                        const wrapper = doc.createElement('div');
                        wrapper.className = 'included-code-block';

                        // toolbar with copy button
                        const toolbar = doc.createElement('div');
                        toolbar.className = 'included-code-toolbar';
                        const copyBtn = doc.createElement('button');
                        copyBtn.className = 'copy-code-btn';
                        copyBtn.textContent = 'Copy';
                        toolbar.appendChild(copyBtn);

                        const pre = doc.createElement('pre');
                        const code = doc.createElement('code');
                        if (lang) code.className = `language-${lang}`;
                        code.textContent = codeText;
                        pre.appendChild(code);

            // attach copy event using event delegation after injecting content
            setTimeout(() => {
                document.querySelectorAll('.included-code-block .copy-code-btn').forEach(btn => {
                    btn.onclick = () => {
                        const pre = btn.parentElement?.nextElementSibling;
                        const codeEl = pre?.querySelector('code');
                        if (codeEl) {
                            const text = codeEl.textContent || '';
                            navigator.clipboard.writeText(text).then(() => {
                                btn.textContent = 'Copied!';
                                setTimeout(() => (btn.textContent = 'Copy'), 1200);
                            }).catch(() => {
                                btn.textContent = 'Failed';
                                setTimeout(() => (btn.textContent = 'Copy'), 1200);
                            })
                        }
                    }
                });
                // highlight after content injection
                try { Prism.highlightAll(); } catch (e) {}
            }, 0);

                        wrapper.appendChild(toolbar);
                        wrapper.appendChild(pre);
                        node.replaceWith(wrapper);
                    } catch (e) {
                        const errDiv = doc.createElement('div');
                        errDiv.style.color = 'red';
                        errDiv.textContent = `无法加载代码: ${src} - ${e.message}`;
                        node.replaceWith(errDiv);
                    }
                }
            }

            const finalHtml = doc.body ? doc.body.innerHTML : htmlContent;
            setCurrentFileContent(finalHtml);
        })
        .catch(error => {
            console.log("Failed to load file", error);
            // 如果加载失败，显示错误信息
            setCurrentFileContent(`<div class="text-red-500 p-4">
                <h2>文件加载失败</h2>
                <p>无法加载文件: ${filePath}</p>
                <p>错误信息: ${error.message}</p>
            </div>`);
        });
    };

    return (
        <>
        <Header />
        <div className="flex flex-col items-center w-full dark:bg-gray-950 dark:text-gray-100 min-h-screen">
            <Navigation 
                items={directoryData}
                onItemClick={handleNavigationClick}
            />
            <div className='flex flex-row w-4/5 justify-between bg-gray-100 dark:bg-gray-900 p-4 shadow-lg flex-grow'>
                <div className='flex-[3]'>
                    <div className="w-full h-full bg-white dark:bg-gray-800 p-4 overflow-auto shadow-lg">
                        <h2 className="font-semibold text-lg mb-4 border-b pb-2 dark:text-gray-100">
                            {sidebarContent ? sidebarContent.name : 'Empty'}
                        </h2>
                        <FileList
                            items={sidebarContent?.children || []}
                            onFileClick={handleFileClick}
                            emptyStateText="No content selected"
                            renderFile={(file, onClick) => {
                                if (file.type === 'file' && file.path.endsWith('.html')) {
                                    return (
                                        <li
                                            key={file.path}
                                            onClick={() => onClick(file)}
                                            className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded transition-colors duration-200 ease-in-out"
                                        >
                                            {file.name.replace('.html', '')}
                                        </li>
                                    );
                                }
                                return null;
                            }}
                        />
                    </div>
                </div>
                <div className='flex-[9] mx-5 bg-white dark:bg-gray-800 p-4 shadow overflow-auto min-h-96'>
                    {/* Here you might display the file content */}
                    {currentFileContent ? (
                        <div dangerouslySetInnerHTML={{ __html: currentFileContent }} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="text-center space-y-4">
                                <h2 className="text-2xl font-semibold text-gray-700">欢迎来到技术文档中心</h2>
                                <p className="text-lg">请从左侧导航栏选择一个分类，然后选择文件来查看内容。</p>
                                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-800 mb-3">可用的技术分类：</h3>
                                    <ul className="text-left space-y-2">
                                        <li>• CSS - 样式和布局技术</li>
                                        <li>• HTML - 网页结构和标记</li>
                                        <li>• JavaScript - 前端交互编程</li>
                                        <li>• Python - 后端开发和数据处理</li>
                                        <li>• Java - 企业级应用开发</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <Footer />
        </>
    );
}

export default Home;