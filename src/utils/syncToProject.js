/**
 * 尝试用 File System Access API 将文件直接写入用户选择的文件夹；
 * 不支持或用户取消时返回 false，调用方可回退为下载。
 * @param {{ name: string, content: string }[]} files - 要写入的文件列表
 * @returns {Promise<boolean>} 是否成功写入
 */
export async function writeFilesToPickedFolder(files) {
  if (!window.showDirectoryPicker) return false;
  try {
    const folder = await window.showDirectoryPicker();
    for (const { name, content } of files) {
      const fileHandle = await folder.getFileHandle(name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    }
    return true;
  } catch (e) {
    if (e.name === 'AbortError') return false;
    throw e;
  }
}
