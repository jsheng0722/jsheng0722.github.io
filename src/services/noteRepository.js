import { isApiConfigured } from '../config/dataBackend';
import { apiFetch } from './apiClient';

export const NOTE_STORAGE_KEYS = {
  userNotes: 'userNotes',
  deletedIds: 'notesDeletedIds',
};

export function getUserNotesFromLocalStorage() {
  try {
    return JSON.parse(localStorage.getItem(NOTE_STORAGE_KEYS.userNotes) || '[]');
  } catch {
    return [];
  }
}

export function setUserNotesToLocalStorage(notes) {
  localStorage.setItem(NOTE_STORAGE_KEYS.userNotes, JSON.stringify(notes));
}

export function getDeletedNoteIdsSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTE_STORAGE_KEYS.deletedIds) || '[]'));
  } catch {
    return new Set();
  }
}

export function recordDeletedNoteId(idStr) {
  try {
    const deletedIds = JSON.parse(localStorage.getItem(NOTE_STORAGE_KEYS.deletedIds) || '[]');
    if (!deletedIds.includes(idStr)) deletedIds.push(idStr);
    localStorage.setItem(NOTE_STORAGE_KEYS.deletedIds, JSON.stringify(deletedIds));
  } catch (_) {}
}

/**
 * 已配置 API 时从远程拉取用户笔记并写入 localStorage 作为缓存。
 * @returns {Promise<Array|null>} 成功返回数组；未配置或失败返回 null（走原静态逻辑）
 */
export async function fetchUserNotesFromApi() {
  if (!isApiConfigured()) return null;
  try {
    const res = await apiFetch('/api/notes', { method: 'GET', cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const arr = Array.isArray(data?.notes)
      ? data.notes
      : Array.isArray(data)
        ? data
        : null;
    if (!Array.isArray(arr)) return null;
    setUserNotesToLocalStorage(arr);
    return arr;
  } catch (e) {
    console.warn('[noteRepository] 远程笔记列表拉取失败', e);
    return null;
  }
}

export async function upsertUserNoteRemote(note) {
  try {
    const res = await apiFetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteUserNoteRemote(idStr) {
  try {
    const res = await apiFetch(
      `/api/notes?id=${encodeURIComponent(idStr)}`,
      { method: 'DELETE' }
    );
    return res.ok;
  } catch {
    return false;
  }
}
