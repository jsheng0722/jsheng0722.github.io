import React, { useState } from 'react';
import { FaMusic } from 'react-icons/fa';
import FixedMusicPlayer from './FixedMusicPlayer';

export default function GlobalMusicToolbar() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      {/* Bottom-left toolbar: toggle music panel */}
      <div className="fixed left-0 bottom-0 z-40 flex flex-col items-center gap-0">
        {isPanelOpen ? null : (
          <button
            type="button"
            onClick={() => setIsPanelOpen(true)}
            className="m-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-200/80 dark:border-gray-700/80 backdrop-blur-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            title="Open music"
          >
            <FaMusic className="w-5 h-5" />
          </button>
        )}

        {/* Music panel: bottom-left, can collapse into left edge */}
        {isPanelOpen && (
          <FixedMusicPlayer
            onClose={() => setIsPanelOpen(false)}
            position="bottom-left"
          />
        )}
      </div>
    </>
  );
}
