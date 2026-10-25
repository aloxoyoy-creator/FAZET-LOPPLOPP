import { useEffect } from 'react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface TvNavigationOptions {
  onMediaPlayPause?: () => void;
  onMediaNext?: () => void;
  onMediaPrevious?: () => void;
  onBack?: () => boolean; // Return true if handled (e.g., modal closed)
}

const getVisibleFocusableElements = (): HTMLElement[] => {
  const nodes = document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return Array.from(nodes).filter((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const style = window.getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
  });
};

const getRectCenter = (rect: DOMRect) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

const findNextSpatialFocus = (
  current: HTMLElement,
  direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
  candidates: HTMLElement[]
): HTMLElement | null => {
  const curRect = current.getBoundingClientRect();
  const curCenter = getRectCenter(curRect);

  let bestCandidate: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const el of candidates) {
    if (el === current) continue;
    const rect = el.getBoundingClientRect();
    const center = getRectCenter(rect);

    const dx = center.x - curCenter.x;
    const dy = center.y - curCenter.y;

    // Filter out elements not in the requested direction
    if (direction === 'ArrowRight' && dx <= 4) continue;
    if (direction === 'ArrowLeft' && dx >= -4) continue;
    if (direction === 'ArrowDown' && dy <= 4) continue;
    if (direction === 'ArrowUp' && dy >= -4) continue;

    const primaryDist =
      direction === 'ArrowLeft' || direction === 'ArrowRight' ? Math.abs(dx) : Math.abs(dy);
    const crossDist =
      direction === 'ArrowLeft' || direction === 'ArrowRight' ? Math.abs(dy) : Math.abs(dx);

    // Weight cross-axis distance heavier so we prefer aligned rows/columns on TV grids
    const score = primaryDist + crossDist * 2.5;

    if (score < bestScore) {
      bestScore = score;
      bestCandidate = el;
    }
  }

  return bestCandidate;
};

/**
 * Global spatial D-Pad and Smart TV remote hardware key navigation hook.
 */
export const useTvNavigation = (options: TvNavigationOptions = {}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isTextInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);

      // 1. Hardware Media Keys (Smart TV Remotes)
      if (
        e.key === 'MediaPlayPause' ||
        e.key === 'MediaPlay' ||
        e.key === 'MediaPause' ||
        e.keyCode === 179 ||
        e.keyCode === 415 ||
        e.keyCode === 19
      ) {
        e.preventDefault();
        options.onMediaPlayPause?.();
        return;
      }

      if (e.key === 'MediaTrackNext' || e.key === 'MediaFastForward' || e.keyCode === 176 || e.keyCode === 417) {
        e.preventDefault();
        options.onMediaNext?.();
        return;
      }

      if (e.key === 'MediaTrackPrevious' || e.key === 'MediaRewind' || e.keyCode === 177 || e.keyCode === 412) {
        e.preventDefault();
        options.onMediaPrevious?.();
        return;
      }

      // 2. Back / Escape Key
      if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'BrowserBack' || e.keyCode === 461 || e.keyCode === 10009) {
        if (isTextInput && e.key === 'Backspace') {
          return; // Allow normal typing backspace inside input fields
        }
        if (options.onBack?.()) {
          e.preventDefault();
          return;
        }
      }

      // 3. Spatial 4-Way D-Pad Navigation
      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        // Allow cursor movement inside text inputs for Left/Right
        if (isTextInput && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          return;
        }

        const focusables = getVisibleFocusableElements();
        if (focusables.length === 0) return;

        e.preventDefault();

        if (!activeEl || !focusables.includes(activeEl)) {
          focusables[0].focus();
          return;
        }

        const next = findNextSpatialFocus(activeEl, e.key, focusables);
        if (next) {
          next.focus();
          next.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options.onMediaPlayPause, options.onMediaNext, options.onMediaPrevious, options.onBack]);
};
