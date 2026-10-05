import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { selectSource } from '../../streaming/quality';
import { pickDefaultSubtitle } from '../../streaming/normalize';
import type { QualityPreference, StreamingResult, SubtitleTrack } from '../../streaming/types';

type Props = {
  result: StreamingResult | null;
  quality: QualityPreference;
  subtitleLanguage: string;
  poster?: string;
  onError?: (message: string) => void;
  onSubtitleTracks?: (tracks: SubtitleTrack[]) => void;
};

export function VideoPlayer({
  result,
  quality,
  subtitleLanguage,
  poster,
  onError,
  onSubtitleTracks,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onSubtitleTracks?.(result?.subtitles ?? []);
  }, [result, onSubtitleTracks]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !result) return;

    const source = selectSource(result.sources, quality);
    if (!source) {
      const msg = 'No playable source for this quality';
      setError(msg);
      onError?.(msg);
      return;
    }

    setLoading(true);
    setError(null);

    const cleanupHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    cleanupHls();
    video.removeAttribute('src');
    video.load();

    const isHls = source.type === 'hls' || source.isM3U8 || source.url.includes('.m3u8');

    if (isHls) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source.url;
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          xhrSetup: (xhr) => {
            if (result.headers) {
              for (const [k, v] of Object.entries(result.headers)) {
                try {
                  xhr.setRequestHeader(k, v);
                } catch {
                  /* ignore forbidden headers in browser */
                }
              }
            }
          },
        });
        hlsRef.current = hls;
        hls.loadSource(source.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (!data.fatal) return;
          const msg =
            data.type === Hls.ErrorTypes.NETWORK_ERROR
              ? 'Network error loading stream'
              : 'Playback error (HLS)';
          setError(msg);
          setLoading(false);
          onError?.(msg);
        });
      } else {
        const msg = 'HLS is not supported in this browser';
        setError(msg);
        onError?.(msg);
        setLoading(false);
        return;
      }
    } else if (source.type === 'mp4' || source.type === 'unknown') {
      video.src = source.url;
    } else {
      const msg = `Unsupported format: ${source.type}`;
      setError(msg);
      onError?.(msg);
      setLoading(false);
      return;
    }

    const onCanPlay = () => setLoading(false);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    const onVidError = () => {
      const msg = 'Video failed to load (expired or blocked source)';
      setError(msg);
      setLoading(false);
      onError?.(msg);
    };

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onVidError);

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onVidError);
      cleanupHls();
    };
  }, [result, quality, onError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      const lang = t.language || '';
      t.mode = subtitleLanguage && lang === subtitleLanguage ? 'showing' : 'hidden';
    }
  }, [subtitleLanguage, result]);

  const defaultSub = pickDefaultSubtitle(result?.subtitles ?? []);

  return (
    <div className="video-player-root">
      {loading && !error && <div className="vp-overlay">Loading stream…</div>}
      {error && (
        <div className="vp-overlay error">
          <strong>Playback error</strong>
          <p>{error}</p>
        </div>
      )}
      <video
        ref={videoRef}
        className="vp-video"
        controls
        playsInline
        poster={poster}
        crossOrigin="anonymous"
      >
        {(result?.subtitles ?? []).map((t) => (
          <track
            key={`${t.language}-${t.url}`}
            kind={t.kind || 'subtitles'}
            srcLang={t.language}
            label={t.label || t.language}
            src={t.url}
            default={Boolean(defaultSub && t.language === defaultSub.language)}
          />
        ))}
      </video>
      <style>{`
        .video-player-root {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000;
        }
        .vp-video {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          background: #000;
        }
        .vp-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: grid;
          place-items: center;
          background: rgba(0,0,0,.45);
          color: #fff;
          font-weight: 600;
          pointer-events: none;
          text-align: center;
          padding: 20px;
        }
        .vp-overlay.error {
          pointer-events: auto;
          background: rgba(8,6,16,.78);
        }
        .vp-overlay.error p {
          margin-top: 8px;
          font-weight: 400;
          color: rgba(255,255,255,.75);
          max-width: 36ch;
        }
      `}</style>
    </div>
  );
}
