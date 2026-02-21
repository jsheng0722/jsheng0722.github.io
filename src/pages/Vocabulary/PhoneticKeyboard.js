import React, { useState, useEffect, useRef } from 'react';
import { FaKeyboard } from 'react-icons/fa';

// 常用 IPA 音标（英语），分组便于点击输入
const IPA_GROUPS = [
  { name: '重音', chars: ['ˈ', 'ˌ', '/', ')', ' '] },
  { name: '元音', chars: ['iː', 'ɪ', 'ʊ', 'uː', 'e', 'ə', 'ɜː', 'ɔː', 'æ', 'ʌ', 'ɑː', 'ɒ'] },
  { name: '辅音', chars: ['p', 'b', 't', 'd', 'k', 'g', 'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h', 'tʃ', 'dʒ', 'm', 'n', 'ŋ', 'l', 'r', 'w', 'j'] }
];

/**
 * 音标小键盘：点击按钮将符号插入到目标位置
 * @param {boolean} open - 是否展开
 * @param {() => void} onToggle - 切换展开/收起
 * @param {(char: string) => void} onInsert - 插入字符时的回调
 */
function PhoneticKeyboard({ open, onToggle, onInsert }) {
  const [activeGroup, setActiveGroup] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onToggle();
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open, onToggle]);

  return (
    <div className="inline-block" ref={panelRef}>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
        title="音标键盘"
      >
        <FaKeyboard className="w-4 h-4" />
        音标键盘
      </button>
      {open && (
        <div className="absolute z-20 mt-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex gap-2 mb-3">
            {IPA_GROUPS.map((g, i) => (
              <button
                key={g.name}
                type="button"
                onClick={() => setActiveGroup(i)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  activeGroup === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 max-w-sm">
            {IPA_GROUPS[activeGroup].chars.map((ch, i) => (
              <button
                key={ch === ' ' ? 'space' : ch + i}
                type="button"
                onClick={() => onInsert(ch)}
                className="min-w-[2.25rem] py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-800 dark:text-gray-200 font-mono text-lg border border-transparent hover:border-blue-400"
              >
                {ch === ' ' ? '空格' : ch}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PhoneticKeyboard;
