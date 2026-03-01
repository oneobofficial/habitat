'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props {
    /** Fires when the circular wipe BEGINS (hero entrance can start immediately) */
    onWipeStart?: () => void
    /** Fires when the full loader sequence is done */
    onComplete: () => void
}

export default function HabitatLoader({ onComplete, onWipeStart }: Props) {
    const loaderRef = useRef<HTMLDivElement>(null)
    const curtainRef = useRef<HTMLDivElement>(null)
    const lettersRef = useRef<HTMLSpanElement[]>([])
    const counterRef = useRef<HTMLSpanElement>(null)
    const sublineRef = useRef<HTMLParagraphElement>(null)
    const progressRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const origOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const loader = loaderRef.current
        const curtain = curtainRef.current
        const counter = counterRef.current
        const subline = sublineRef.current
        const progress = progressRef.current
        if (!loader || !curtain || !counter || !subline) return

        const letters = lettersRef.current.filter(Boolean)

        // ── Initial states ────────────────────────────────────────────────
        gsap.set(letters, {
            yPercent: 115, opacity: 0,
            clipPath: 'inset(0 0 100% 0)',
            willChange: 'transform, opacity',
        })
        gsap.set(subline, { opacity: 0, y: 20 })
        gsap.set(curtain, { clipPath: 'circle(0% at 50% 50%)' })
        if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' })

        // ── Master timeline ───────────────────────────────────────────────
        const tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: () => {
                document.body.style.overflow = origOverflow
                onComplete()
            },
        })

        // 1. Letters pour in (liquid stagger)
        tl.to(letters, {
            yPercent: 0, opacity: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.15,
            stagger: { amount: 0.5, ease: 'power2.out' },
            ease: 'expo.out', force3D: true,
        }, 0.1)

        // 2. Subline + progress bar
        tl.to(subline, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.75)
        if (progress) {
            tl.to(progress, { scaleX: 1, duration: 1.85, ease: 'power2.inOut' }, 0.2)
        }

        // 3. Decimal counter (parallel)
        const counterObj = { val: 0 }
        tl.to(counterObj, {
            val: 100, duration: 1.9, ease: 'power2.inOut',
            onUpdate() {
                const v = counterObj.val
                counter.textContent =
                    String(Math.floor(v)).padStart(2, '0') + '.' +
                    String(Math.round((v % 1) * 100)).padStart(2, '0')
            },
            onComplete() { counter.textContent = '100.00' },
        }, 0.15)

        // 4. Brief hold at 100
        tl.addLabel('hold', '+=0.18')

        // 5. Letters compress toward center (morph into navbar)
        tl.to(letters, {
            scale: 0.05, opacity: 0, y: -180,
            duration: 0.65,
            stagger: { amount: 0.1, from: 'center' },
            ease: 'power3.in', force3D: true,
        }, 'hold')
        tl.to([subline, counter], { opacity: 0, duration: 0.3, ease: 'none' }, 'hold')
        if (progress) tl.to(progress, { opacity: 0, duration: 0.25 }, 'hold')

        // 6. Circular wipe reveal — fires onWipeStart so hero can begin in sync
        tl.add(() => { onWipeStart?.() }, '-=0.05')
        tl.to(curtain, {
            clipPath: 'circle(150% at 50% 50%)',
            duration: 1.0, ease: 'power3.inOut',
        }, '-=0.05')

        // 7. Fade + remove loader
        tl.to(loader, {
            opacity: 0, duration: 0.3, ease: 'none',
            onComplete: () => { loader.style.display = 'none' },
        }, '-=0.1')

        return () => { tl.kill(); document.body.style.overflow = origOverflow }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const LETTERS = 'HABITAT'.split('')

    return (
        <div
            ref={loaderRef}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
            style={{ backgroundColor: '#F7F3EE' }}
            aria-hidden="true"
        >
            {/* Grain */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.68' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.032'/%3E%3C/svg%3E")`,
                }}
            />
            {/* Gold ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: '80vw', height: '55vh', background: 'radial-gradient(ellipse at top, rgba(200,169,106,0.07) 0%, transparent 70%)' }} />

            {/* HABITAT letters */}
            <div className="relative flex items-center overflow-visible" style={{ gap: 'clamp(0.05rem, 0.4vw, 0.6rem)' }}>
                {LETTERS.map((ch, i) => (
                    <span
                        key={i}
                        ref={el => { if (el) lettersRef.current[i] = el }}
                        className="block leading-none select-none"
                        style={{
                            fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                            fontSize: 'clamp(4.5rem, 14vw, 16rem)',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: '#2E2B28',
                            willChange: 'transform, opacity',
                        }}
                    >{ch}</span>
                ))}
            </div>

            {/* Subline */}
            <p
                ref={sublineRef}
                className="mt-4 select-none"
                style={{
                    fontFamily: 'var(--font-montserrat), "Inter", sans-serif',
                    fontSize: 'clamp(0.5rem, 1vw, 0.65rem)',
                    color: 'rgba(46,43,40,0.4)',
                    fontWeight: 400,
                    letterSpacing: '0.45em',
                    textTransform: 'uppercase',
                }}
            >Urban Sanctuary · Banjara Hills</p>

            {/* Gold progress bar — bottom edge */}
            <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden">
                <div
                    ref={progressRef}
                    className="h-full w-full"
                    style={{ background: 'linear-gradient(90deg, #C8A96A 0%, #D4B87A 60%, rgba(200,169,106,0.4) 100%)', willChange: 'transform' }}
                />
            </div>

            {/* Decimal counter */}
            <div
                className="absolute bottom-6 right-6 md:bottom-10 md:right-12 tabular-nums select-none"
                style={{
                    fontFamily: 'var(--font-montserrat), "Inter", sans-serif',
                    fontSize: 'clamp(0.58rem, 1.1vw, 0.75rem)',
                    letterSpacing: '0.18em',
                    color: 'rgba(46,43,40,0.35)',
                    fontWeight: 300,
                }}
            ><span ref={counterRef}>00.00</span></div>

            {/* Circular curtain */}
            <div
                ref={curtainRef}
                className="absolute inset-0"
                style={{ backgroundColor: '#0A0908', clipPath: 'circle(0% at 50% 50%)', willChange: 'clip-path', zIndex: 2 }}
            />
        </div>
    )
}
