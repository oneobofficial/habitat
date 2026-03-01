'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'

// ---------------------------------------------------------------------------
// Custom event helpers — call from Tab Navigation menu items
// ---------------------------------------------------------------------------
export function emitMenuEnter(imgUrl: string) {
    window.dispatchEvent(new CustomEvent('habitat:menu-enter', { detail: { imgUrl } }))
}
export function emitMenuLeave() {
    window.dispatchEvent(new CustomEvent('habitat:menu-leave'))
}

// ---------------------------------------------------------------------------
// Lerp helper
// ---------------------------------------------------------------------------
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const LERP_FACTOR = 0.12 // lower = heavier/smoother, higher = snappier

// ---------------------------------------------------------------------------

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null)
    const imgBoxRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    const [isMobile, setIsMobile] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        const mq = window.matchMedia('(pointer: coarse), (max-width: 768px)')
        const check = () => setIsMobile(mq.matches)
        check()
        mq.addEventListener('change', check)
        return () => mq.removeEventListener('change', check)
    }, [])

    useEffect(() => {
        if (isMobile || !mounted) return
        const dot = dotRef.current
        const imgBox = imgBoxRef.current
        if (!dot || !imgBox) return

        // ── State: raw mouse position (updated on every mousemove) ──────────
        const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

        // ── State: smoothed/lerped position (updated every ticker frame) ────
        const pos = { x: mouse.x, y: mouse.y }

        // ── Flags ────────────────────────────────────────────────────────────
        let appeared = false
        let imageActive = false

        // ── Initial GSAP state ───────────────────────────────────────────────
        // xPercent/yPercent: -50 centres both elements under the cursor hotspot
        gsap.set(dot, { xPercent: -50, yPercent: -50, x: pos.x, y: pos.y, autoAlpha: 0, scale: 1 })
        gsap.set(imgBox, { xPercent: -50, yPercent: -50, x: pos.x, y: pos.y, scale: 0, autoAlpha: 0 })

        // ── 1. Raw mouse tracker (passive — never blocks scroll) ─────────────
        const onMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX
            mouse.y = e.clientY
            if (!appeared) {
                appeared = true
                gsap.to(dot, { autoAlpha: 1, duration: 0.3 })
            }
        }

        window.addEventListener('mousemove', onMouseMove, { passive: true })

        // ── 2. GSAP Ticker — runs every requestAnimationFrame frame ──────────
        // Lerp the smoothed position toward the raw mouse position,
        // then apply to both dot and (if active) image box via gsap.set().
        // gsap.set uses translate3d internally — Chrome compositor-safe.
        const ticker = () => {
            pos.x = lerp(pos.x, mouse.x, LERP_FACTOR)
            pos.y = lerp(pos.y, mouse.y, LERP_FACTOR)
            gsap.set(dot, { x: pos.x, y: pos.y })
            if (imageActive) {
                gsap.set(imgBox, { x: pos.x, y: pos.y })
            }
        }
        gsap.ticker.add(ticker)
        gsap.ticker.lagSmoothing(0) // disable lag smoothing so lerp stays consistent

        // ── 3. Press animation ───────────────────────────────────────────────
        const onDown = () => gsap.to(dot, { scale: 0.7, duration: 0.1, ease: 'power2.in', overwrite: 'auto' })
        const onUp = () => gsap.to(dot, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' })
        window.addEventListener('mousedown', onDown, { passive: true })
        window.addEventListener('mouseup', onUp, { passive: true })

        // ── 4. Footer colour — dot turns gold when cursor enters footer ───────
        const footer = document.getElementById('footer-section')
        const onFooterEnter = () => gsap.to(dot, { background: '#C8A96A', duration: 0.3, ease: 'power2.out' })
        const onFooterLeave = () => gsap.to(dot, { background: '#0A0908', duration: 0.3, ease: 'power2.out' })
        footer?.addEventListener('mouseenter', onFooterEnter)
        footer?.addEventListener('mouseleave', onFooterLeave)

        // ── 4. Menu image-follow events ──────────────────────────────────────
        const onMenuEnter = (e: Event) => {
            const { imgUrl } = (e as CustomEvent).detail as { imgUrl: string }
            const img = imgRef.current
            if (!img) return

            imageActive = true
            img.src = imgUrl

            // Snap image box to current smoothed pos so reveal starts at cursor
            gsap.set(imgBox, { x: pos.x, y: pos.y })

            gsap.killTweensOf([imgBox, dot])
            gsap.to(dot, { autoAlpha: 0, scale: 0.5, duration: 0.2, ease: 'power2.in', overwrite: 'auto' })
            gsap.to(imgBox, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
        }

        const onMenuLeave = () => {
            imageActive = false
            gsap.killTweensOf([imgBox, dot])
            gsap.to(imgBox, { scale: 0, autoAlpha: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto' })
            gsap.to(dot, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
        }

        window.addEventListener('habitat:menu-enter', onMenuEnter)
        window.addEventListener('habitat:menu-leave', onMenuLeave)

        return () => {
            gsap.ticker.remove(ticker)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mousedown', onDown)
            window.removeEventListener('mouseup', onUp)
            window.removeEventListener('habitat:menu-enter', onMenuEnter)
            window.removeEventListener('habitat:menu-leave', onMenuLeave)
            footer?.removeEventListener('mouseenter', onFooterEnter)
            footer?.removeEventListener('mouseleave', onFooterLeave)
        }
    }, [isMobile, mounted])

    if (isMobile || !mounted) return null

    return createPortal(
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',   // cursor NEVER intercepts clicks/hovers
                zIndex: 999999,
                overflow: 'hidden',
                userSelect: 'none',
            }}
        >
            {/* Black dot — lerped, 14px */}
            <div
                ref={dotRef}
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#0A0908',
                    willChange: 'transform',
                }}
            />

            {/* Image bubble — follows lerped position when menu item hovered */}
            <div
                ref={imgBoxRef}
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '160px',
                    aspectRatio: '3/4',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    willChange: 'transform, opacity',
                    boxShadow: '0 8px 40px rgba(10,9,8,0.35)',
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    ref={imgRef}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    draggable={false}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(10,9,8,0.3) 0%, transparent 55%)',
                }} />
            </div>
        </div>,
        document.body
    )
}
