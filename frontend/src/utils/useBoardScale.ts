import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { size } from '../game/assets';

/**
 * Works out the `--unit` pixel scale so the whole game fits its host while
 * keeping the pixel-art aspect ratio. Cells snap to a whole number of pixels so
 * rounding never clips the border.
 *
 * The game occupies two kinds of space. Scaling chrome (top panel, frame,
 * bevels, grid) grows with `--unit`, so it is summed in unit multiples. Fixed
 * chrome (host padding, the button row above the frame) does not scale, so it is
 * measured from the DOM and subtracted as real pixels.
 *
 * Attach `containerRef` to the scaling container and `chromeRef` to the fixed
 * row stacked above the frame (the exit button or versus bar).
 */
export function useBoardScale(cols: number, rows: number) {
    const containerEl = useRef<HTMLElement | null>(null);
    const chromeEl = useRef<HTMLElement | null>(null);
    const [unit, setUnit] = useState(2);

    const recompute = useCallback(() => {
        const game = containerEl.current;
        const host = game?.parentElement;
        if (!game || !host) {
            return;
        }

        // Everything that scales with --unit, measured in unit-multiples.
        const frameChrome = 18; // .game-frame padding (6) + border (3) per side
        const boardBevel = 8; // board outer bevel (2) + inner grid bevel (2) per side
        const panelGap = 6; // top-panel margin-bottom
        const unitsW = frameChrome + boardBevel + size.borderLeft + size.borderRight + cols * size.cell;
        const unitsH = frameChrome + boardBevel + panelGap + size.topH + size.borderTop + size.borderBottom + rows * size.cell;

        // Real pixels available inside the host, excluding its padding.
        const hostStyle = getComputedStyle(host);
        const padX = parseFloat(hostStyle.paddingLeft) + parseFloat(hostStyle.paddingRight);
        const padY = parseFloat(hostStyle.paddingTop) + parseFloat(hostStyle.paddingBottom);
        const availW = host.clientWidth - padX;
        let availH = host.clientHeight - padY;

        // Subtract the fixed row stacked above the frame (button row + the
        // column gap that separates it from the frame).
        const chrome = chromeEl.current;
        if (chrome) {
            const gameStyle = getComputedStyle(game);
            const gap = parseFloat(gameStyle.rowGap || gameStyle.columnGap || '0') || 0;
            availH -= chrome.getBoundingClientRect().height + gap;
        }

        const raw = Math.min(availW / unitsW, availH / unitsH);
        const cellPx = Math.max(8, Math.floor(raw * size.cell));
        setUnit(cellPx / size.cell);
    }, [cols, rows]);

    const containerRef = useCallback(
        (el: HTMLElement | null) => {
            containerEl.current = el;
            recompute();
        },
        [recompute],
    );
    const chromeRef = useCallback(
        (el: HTMLElement | null) => {
            chromeEl.current = el;
            recompute();
        },
        [recompute],
    );

    useLayoutEffect(() => {
        recompute();
        const ro = new ResizeObserver(() => recompute());
        const host = containerEl.current?.parentElement;
        if (host) {
            ro.observe(host);
        }
        if (chromeEl.current) {
            ro.observe(chromeEl.current);
        }
        window.addEventListener('resize', recompute);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', recompute);
        };
    }, [recompute]);

    return { unit, containerRef, chromeRef };
}
