import type { VideoItem } from './youtubeRadioService';

class BackgroundMediaManager {
  private audioCarrier: HTMLAudioElement | null = null;
  private isInitialized = false;

  constructor() {
    // Lazy setup on first interaction
  }

  private initAudioCarrier() {
    if (this.isInitialized || typeof window === 'undefined') return;
    try {
      // 1-second silent WAV base64 loop to hold Android & iOS background media session
      const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      this.audioCarrier = new Audio(silentWav);
      this.audioCarrier.loop = true;
      this.audioCarrier.volume = 0.01;
      this.isInitialized = true;
    } catch (err) {
      console.warn('[BackgroundMedia] Failed to init audio carrier:', err);
    }
  }

  /**
   * Sync active video metadata with Android / iOS / Desktop MediaSession
   * Allows playback controls from lock screen, notification drawer, and headset!
   */
  public syncMediaSession(
    video: VideoItem | null,
    controls: {
      onPlay?: () => void;
      onPause?: () => void;
      onNext?: () => void;
      onPrev?: () => void;
    }
  ) {
    if (typeof window === 'undefined') return;

    this.initAudioCarrier();

    if (!video) {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
      if (this.audioCarrier) {
        this.audioCarrier.pause();
      }
      return;
    }

    // Play silent carrier so mobile OS doesn't suspend playback when switching apps or locking phone
    if (this.audioCarrier && this.audioCarrier.paused) {
      this.audioCarrier.play().catch(() => {
        // May require user gesture, will succeed on next tap
      });
    }

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: video.title,
          artist: video.channelTitle || 'YouTube Music',
          album: 'FAZET School Hub • Auto-Playlist',
          artwork: [
            {
              src: video.thumbnail || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
              sizes: '512x512',
              type: 'image/jpeg',
            },
            {
              src: `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`,
              sizes: '320x180',
              type: 'image/jpeg',
            },
          ],
        });

        navigator.mediaSession.playbackState = 'playing';

        // Action Handlers for Lock Screen & Notification Center
        if (controls.onPlay) {
          navigator.mediaSession.setActionHandler('play', () => {
            controls.onPlay?.();
            if (this.audioCarrier) void this.audioCarrier.play();
          });
        }

        if (controls.onPause) {
          navigator.mediaSession.setActionHandler('pause', () => {
            controls.onPause?.();
            if (this.audioCarrier) this.audioCarrier.pause();
          });
        }

        if (controls.onNext) {
          navigator.mediaSession.setActionHandler('nexttrack', () => {
            controls.onNext?.();
          });
        }

        if (controls.onPrev) {
          navigator.mediaSession.setActionHandler('previoustrack', () => {
            controls.onPrev?.();
          });
        }

        // Support seek to prevent errors
        navigator.mediaSession.setActionHandler('seekto', () => {});
      } catch (err) {
        console.warn('[BackgroundMedia] MediaSession setup error:', err);
      }
    }
  }

  /**
   * Request native Document Picture-in-Picture window if supported by browser/OS
   * This creates an actual OS floating window that hovers outside the browser/app!
   */
  public async requestDocumentPiP(width = 380, height = 260): Promise<Window | null> {
    if (typeof window === 'undefined') return null;
    const nav = window as any;
    if ('documentPictureInPicture' in nav && typeof nav.documentPictureInPicture.requestWindow === 'function') {
      try {
        const pipWindow = await nav.documentPictureInPicture.requestWindow({
          width,
          height,
        });
        return pipWindow;
      } catch (err) {
        console.warn('[BackgroundMedia] Document PiP request failed:', err);
      }
    }
    return null;
  }
}

export const backgroundMedia = new BackgroundMediaManager();
