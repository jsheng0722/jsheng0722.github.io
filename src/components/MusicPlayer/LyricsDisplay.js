import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { parseLRC, getCurrentLyric } from '../../utils/lrcParser';

function LyricsDisplay({ currentMusic, currentTime, isVisible, onClose }) {
  const [lyricsData, setLyricsData] = useState({ metadata: {}, lyrics: [] });
  const [currentLyric, setCurrentLyric] = useState({ index: -1, text: '', prevText: '', nextText: '' });

  useEffect(() => {
    if (!currentMusic?.lyricsFile) {
      setLyricsData({ metadata: {}, lyrics: [] });
      return;
    }
    fetch(currentMusic.lyricsFile)
      .then((res) => res.text())
      .then((lrcContent) => {
        setLyricsData(parseLRC(lrcContent));
      })
      .catch(() => setLyricsData({ metadata: {}, lyrics: [] }));
  }, [currentMusic]);

  useEffect(() => {
    if (lyricsData.lyrics.length > 0) {
      setCurrentLyric(getCurrentLyric(lyricsData.lyrics, currentTime));
    }
  }, [lyricsData, currentTime]);

  if (!isVisible || !currentMusic) return null;

  const hasLyrics = lyricsData.lyrics.length > 0;

  return (
    <>
      {/* Subtitle-style overlay: bottom center, transparent */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 pointer-events-none flex flex-col items-center justify-end pb-12 px-4"
        style={{ background: 'transparent' }}
      >
        <div className="max-w-2xl w-full flex flex-col items-center gap-1 text-center">
          {hasLyrics ? (
            <>
              {currentLyric.prevText && (
                <p
                  className="text-sm text-white/60"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.6)',
                  }}
                >
                  {currentLyric.prevText}
                </p>
              )}
              <p
                className="text-lg md:text-xl font-medium text-white leading-relaxed"
                style={{
                  textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                {currentLyric.text || '♪'}
              </p>
              {currentLyric.nextText && (
                <p
                  className="text-sm text-white/50"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.6)',
                  }}
                >
                  {currentLyric.nextText}
                </p>
              )}
            </>
          ) : (
            <p
              className="text-sm text-white/70"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
            >
              No lyrics · Add .lrc in the track folder
            </p>
          )}
        </div>
      </div>

      {/* Close button: pointer-events-auto so it's clickable */}
      <button
        onClick={onClose}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[51] pointer-events-auto p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        title="Close lyrics"
      >
        <FaTimes className="w-4 h-4" />
      </button>
    </>
  );
}

export default LyricsDisplay;
