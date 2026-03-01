'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScroll() {
    useEffect(() => {
        // Prevent animation jumping on mobile address-bar resize
        ScrollTrigger.config({ ignoreMobileResize: true })

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        })

        // ── Sync Lenis with GSAP ticker (better than raw rAF — stays locked
        //    to the same 60/120fps frame budget as all GSAP animations)
        const onTick = (time: number) => lenis.raf(time * 1000)
        gsap.ticker.add(onTick)

        // Also notify ScrollTrigger on every Lenis scroll event
        lenis.on('scroll', ScrollTrigger.update)

        // Disable Lenis smooth scroll on mobile to save battery & avoid jank
        const isMobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
        if (isMobile) {
            lenis.destroy()
            gsap.ticker.remove(onTick)
            return
        }

        return () => {
            gsap.ticker.remove(onTick)
            lenis.destroy()
        }
    }, [])

    return null
}
