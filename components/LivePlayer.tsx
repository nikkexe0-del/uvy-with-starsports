import React, { useRef } from 'react';
import { X, Maximize2, ExternalLink, Copy } from 'lucide-react';

interface LivePlayerProps {
  url: string;
  keyId?: string;
  key?: string;
  cookie?: string;
  onClose?: () => void;
  title?: string;
}

export const LivePlayer: React.FC<LivePlayerProps> = ({ url, keyId, key: drmKey, cookie, onClose, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isM3u8 = url.toLowerCase().includes('.m3u8');

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert('Stream URL copied!');
  };

  const handleNewTab = () => {
    window.open(url, '_blank');
  };

  const playerHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.jsdelivr.net/npm/shaka-player@4.16.2/dist/shaka-player.ui.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/shaka-player@4.16.2/dist/controls.css">
        <style>
          body { margin: 0; background: #000; height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; }
          #video-container { width: 100%; height: 100%; }
          video { width: 100%; height: 100%; outline: none; }
          .shaka-video-container { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="video-container" shaka-controls="true">
          <video id="video" autoplay playsinline></video>
        </div>
        <script>
          async function initPlayer() {
            const video = document.getElementById('video');
            const uiContainer = document.getElementById('video-container');
            const player = new shaka.Player(video);
            const ui = new shaka.ui.Overlay(player, uiContainer, video);

            const config = {
              manifest: { defaultPresentationDelay: 5 },
              streaming: { lowLatencyMode: true, bufferingGoal: 10, rebufferingGoal: 2 }
            };

            const keyId = '${keyId || ''}';
            const drmKey = '${drmKey || ''}';
            if (keyId && drmKey) {
              config.drm = { clearKeys: { [keyId]: drmKey } };
            }
            
            player.configure(config);

            const cookieValue = '${cookie || ''}';
            if (cookieValue) {
              player.getNetworkingEngine().registerRequestFilter((type, request) => {
                request.headers['Referer'] = 'https://www.jiotv.com/';
                request.headers['User-Agent'] = 'plaYtv/7.1.5 (Linux;Android 13) ExoPlayerLib/2.11.6';
                request.headers['Cookie'] = cookieValue;
                const urlCookie = cookieValue.startsWith('__hdnea__=') ? cookieValue.substring(10) : cookieValue;
                if (!request.uris[0].includes('__hdnea__')) {
                  const sep = request.uris[0].includes('?') ? '&' : '?';
                  request.uris[0] += sep + '__hdnea__=' + urlCookie;
                }
              });
            }

            try {
              await player.load('${url}');
            } catch (e) {
              console.error('Error code', e.code, 'object', e);
            }
          }
          document.addEventListener('shaka-ui-loaded', initPlayer);
          document.addEventListener('DOMContentLoaded', () => {
            if (window.shaka && shaka.ui) initPlayer();
          });
        </script>
      </body>
    </html>
  `;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black group min-h-[inherit]">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handleCopy}
          title="Copy URL"
          className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-white text-white hover:text-black transition-all border border-white/10 backdrop-blur-md"
        >
          <Copy size={18} />
        </button>
        <button 
          onClick={handleNewTab}
          title="Open in new tab"
          className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-white text-white hover:text-black transition-all border border-white/10 backdrop-blur-md"
        >
          <ExternalLink size={18} />
        </button>
        <button 
          onClick={handleFullscreen}
          title="Fullscreen"
          className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-white text-white hover:text-black transition-all border border-white/10 backdrop-blur-md"
        >
          <Maximize2 size={18} />
        </button>
        {onClose && (
          <button 
            onClick={onClose}
            title="Close"
            className="w-10 h-10 rounded-full bg-red-600/60 flex items-center justify-center hover:bg-red-600 text-white transition-all border border-white/10 backdrop-blur-md"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isM3u8 ? (
        <iframe
          src={url}
          className="w-full h-full border-none"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title={title}
        />
      ) : (
        <iframe
          srcDoc={playerHtml}
          className="w-full h-full border-none"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title={title}
        />
      )}
    </div>
  );
};

