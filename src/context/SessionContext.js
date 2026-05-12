/**
 * 会话上下文：按「无操作 30 分钟」计时，超时后弹窗询问继续或结束。
 * 只有连续 30 分钟没有任何操作时才提示；任何操作（点击、滚动、按键等）会重置这 30 分钟。
 * 用于单词本等页在 session 内保持「已同步」提示不消失、并统计同步次数。
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Modal } from '../components/UI';

const SESSION_STORAGE_KEY = 'appLastActivityAt';
const SESSION_ENABLED_KEY = 'appSessionEnabled';
const VOCAB_SYNC_COUNT_KEY = 'vocabSyncCount';
const INACTIVITY_DURATION_MS = 30 * 60 * 1000; // 无操作 30 分钟
const CHECK_INTERVAL_MS = 60 * 1000; // 每分钟检查一次
const ACTIVITY_THROTTLE_MS = 1000; // 活动节流：至少间隔 1 秒才更新一次
const MODAL_AUTO_END_SECONDS = 10; // 弹窗出现后若未操作，10 秒后自动结束 session

const SessionContext = createContext();

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

function getLastActivityAt() {
  try {
    const v = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const t = v ? parseInt(v, 10) : 0;
    return Number.isFinite(t) ? t : 0;
  } catch (_) {
    return 0;
  }
}

function getSessionEnabled() {
  try {
    return sessionStorage.getItem(SESSION_ENABLED_KEY) === '1';
  } catch (_) {
    return false;
  }
}

export function isInSession() {
  if (!getSessionEnabled()) return false;
  const last = getLastActivityAt();
  if (!last) return false;
  return Date.now() - last <= INACTIVITY_DURATION_MS;
}

export function SessionProvider({ children }) {
  const [sessionEnabled, setSessionEnabled] = useState(() => getSessionEnabled());
  const [lastActivityAt, setLastActivityAt] = useState(() => {
    if (!getSessionEnabled()) return 0;
    return getLastActivityAt() || Date.now();
  });
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [modalCountdown, setModalCountdown] = useState(0);
  const lastUpdateRef = useRef(lastActivityAt || 0);
  const enabledRef = useRef(sessionEnabled);

  useEffect(() => {
    enabledRef.current = sessionEnabled;
  }, [sessionEnabled]);

  // 如果 session 已开启，确保有一个合理的「最后活动时间」
  useEffect(() => {
    if (!sessionEnabled) return;
    const existing = getLastActivityAt();
    const now = Date.now();
    const value = existing || now;
    sessionStorage.setItem(SESSION_STORAGE_KEY, String(value));
    setLastActivityAt(value);
    lastUpdateRef.current = value;
  }, [sessionEnabled]);

  // 监听用户操作，有操作则重置「最后活动时间」（节流）
  useEffect(() => {
    const updateActivity = () => {
      if (!enabledRef.current) return;
      const now = Date.now();
      if (now - lastUpdateRef.current < ACTIVITY_THROTTLE_MS) return;
      lastUpdateRef.current = now;
      sessionStorage.setItem(SESSION_STORAGE_KEY, String(now));
      setLastActivityAt(now);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach((ev) => window.addEventListener(ev, updateActivity));
    return () => events.forEach((ev) => window.removeEventListener(ev, updateActivity));
  }, []);

  // 定时检查：仅当「无操作超过 30 分钟」时才弹窗
  useEffect(() => {
    if (!sessionEnabled) return;
    const id = setInterval(() => {
      const last = getLastActivityAt();
      if (!last) return;
      if (Date.now() - last > INACTIVITY_DURATION_MS) {
        setShowSessionModal(true);
      }
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [sessionEnabled]);

  const startSession = useCallback(() => {
    const now = Date.now();
    try {
      sessionStorage.setItem(SESSION_ENABLED_KEY, '1');
      sessionStorage.setItem(SESSION_STORAGE_KEY, String(now));
    } catch (_) {}
    setSessionEnabled(true);
    lastUpdateRef.current = now;
    setLastActivityAt(now);
    setShowSessionModal(false);
  }, []);

  const extendSession = useCallback(() => {
    const now = Date.now();
    try {
      sessionStorage.setItem(SESSION_ENABLED_KEY, '1');
      sessionStorage.setItem(SESSION_STORAGE_KEY, String(now));
    } catch (_) {}
    setSessionEnabled(true);
    lastUpdateRef.current = now;
    setLastActivityAt(now);
    setShowSessionModal(false);
  }, []);

  const endSession = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_ENABLED_KEY);
      sessionStorage.removeItem(VOCAB_SYNC_COUNT_KEY);
      sessionStorage.removeItem('vocabSyncSuccessUntil');
    } catch (_) {}
    setSessionEnabled(false);
    setLastActivityAt(0);
    setShowSessionModal(false);
    window.location.reload();
  }, []);

  // 弹窗出现后 10 秒倒计时，到时自动结束 session
  useEffect(() => {
    if (!showSessionModal) {
      setModalCountdown(0);
      return;
    }
    setModalCountdown(MODAL_AUTO_END_SECONDS);
    const id = setInterval(() => {
      setModalCountdown((prev) => {
        if (prev <= 1) {
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [showSessionModal, endSession]);

  const inSession = sessionEnabled && lastActivityAt > 0 && Date.now() - lastActivityAt <= INACTIVITY_DURATION_MS;

  const value = {
    sessionEnabled,
    lastActivityAt: lastActivityAt || null,
    inSession,
    startSession,
    extendSession,
    endSession,
    VOCAB_SYNC_COUNT_KEY
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
      <Modal
        isOpen={showSessionModal}
        onClose={() => {}}
        title="会话超时"
        showCloseButton={false}
        closeOnOverlayClick={false}
        closeOnEscape={false}
        size="small"
      >
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          已超过 30 分钟，是否继续使用？
        </p>
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
          {modalCountdown > 0 ? `${modalCountdown} 秒后自动结束会话` : '正在结束…'}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={endSession}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            结束
          </button>
          <button
            type="button"
            onClick={extendSession}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            继续
          </button>
        </div>
      </Modal>
    </SessionContext.Provider>
  );
}
