/**
 * 无后端场景下，将数据同步到本地：
 * - Chrome/Edge：使用 File System Access API 选择目录并直接写入 JSON
 * - 其他浏览器：由调用方触发下载，用户将文件放入仓库后 git push
 */

/** 是否支持“选择目录并写入”（当前仅 Chromium 系） */
export function canUseFileSystemAccess() {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

/**
 * 将文件列表写入用户选择的文件夹（需 Chrome/Edge）。
 * @param {{ name: string, content: string }[]} files
 * @returns {Promise<{ success: boolean, cancelledByUser?: boolean }>}
 */
export async function writeFilesToPickedFolder(files) {
  if (!canUseFileSystemAccess()) return { success: false, cancelledByUser: false };
  try {
    const folder = await window.showDirectoryPicker();
    for (const { name, content } of files) {
      const fileHandle = await folder.getFileHandle(name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    }
    return { success: true };
  } catch (e) {
    if (e.name === 'AbortError') return { success: false, cancelledByUser: true };
    throw e;
  }
}
