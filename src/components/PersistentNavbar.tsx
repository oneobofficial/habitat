'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { Bot } from 'lucide-react'
import HabitatAI from './HabitatAI'

gsap.registerPlugin(ScrollToPlugin)

export default function PersistentNavbar() {
    const headerRef = useRef<HTMLElement>(null)
    const menuLine1Ref = useRef<HTMLSpanElement>(null)
    const menuLine2Ref = useRef<HTMLSpanElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const menuLinksRef = useRef<HTMLDivElement>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)
    const navHiddenRef = useRef(false)

    // Load-in animation
    useEffect(() => {
        const header = headerRef.current
        if (!header) return
        gsap.fromTo(
            header,
            { y: -80, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: 0.2 }
        )
    }, [])

    // Single performant rAF scroll handler: glass-nav + footer slide logic
    useEffect(() => {
        const header = headerRef.current
        if (!header) return

        let rafId: number
        const onScroll = () => {
            cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(() => {
                const y = window.scrollY
                const docH = document.documentElement.scrollHeight
                const winH = window.innerHeight

                // Footer reveal detection: content-wrapper has marginBottom:100vh,
                // so footer is visible when user is within 120px of document bottom
                const nearBottom = y + winH >= docH - 120

                if (nearBottom && !navHiddenRef.current) {
                    navHiddenRef.current = true
                    gsap.to(header, { y: '-110%', duration: 0.5, ease: 'power3.inOut', overwrite: true })
                } else if (!nearBottom && navHiddenRef.current) {
                    navHiddenRef.current = false
                    gsap.to(header, { y: '0%', duration: 0.5, ease: 'power3.out', overwrite: true })
                }
            })
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            cancelAnimationFrame(rafId)
        }
    }, [])


    const handleMenuHover = (isEntering: boolean) => {
        const line1 = menuLine1Ref.current
        const line2 = menuLine2Ref.current
        if (!line1 || !line2 || isMenuOpen) return

        if (isEntering) {
            gsap.to(line1, { rotation: 5, scaleX: 1.15, duration: 0.35, ease: 'power2.out' })
            gsap.to(line2, { rotation: -5, scaleX: 1.15, duration: 0.35, ease: 'power2.out' })
        } else {
            gsap.to([line1, line2], { rotation: 0, scaleX: 1, duration: 0.35, ease: 'power2.out' })
        }
    }

    const openMenu = () => {
        const overlay = overlayRef.current
        const menuLinks = menuLinksRef.current
        const line1 = menuLine1Ref.current
        const line2 = menuLine2Ref.current
        if (!overlay || !menuLinks || !line1 || !line2) return

        setIsMenuOpen(true)
        document.body.style.overflow = 'hidden'

        // Hamburger → X morph
        gsap.to(line1, { rotation: 45, y: 5, duration: 0.4, ease: 'power2.inOut' })
        gsap.to(line2, { rotation: -45, y: -5, duration: 0.4, ease: 'power2.inOut' })

        // Circle-wipe overlay entrance
        gsap.set(overlay, { display: 'flex' })
        gsap.fromTo(
            overlay,
            { clipPath: 'circle(0% at 50% 10%)', opacity: 0 },
            { clipPath: 'circle(150% at 50% 10%)', opacity: 1, duration: 0.9, ease: 'power3.inOut' }
        )

        // Staggered link entrance
        const links = menuLinks.querySelectorAll('.menu-link')
        gsap.fromTo(
            links,
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.35 }
        )
    }

    const closeMenu = (callback?: () => void) => {
        const overlay = overlayRef.current
        const menuLinks = menuLinksRef.current
        const line1 = menuLine1Ref.current
        const line2 = menuLine2Ref.current
        if (!overlay || !menuLinks || !line1 || !line2) return

        const links = menuLinks.querySelectorAll('.menu-link')
        gsap.to(links, { y: -30, opacity: 0, duration: 0.35, stagger: 0.045, ease: 'power2.in' })

        gsap.to(overlay, {
            clipPath: 'circle(0% at 50% 10%)',
            opacity: 0,
            duration: 0.65,
            ease: 'power3.inOut',
            onComplete: () => {
                gsap.set(overlay, { display: 'none' })
                setIsMenuOpen(false)
                document.body.style.overflow = ''
                if (callback) callback()
            },
        })

        // X → hamburger morph
        gsap.to([line1, line2], { rotation: 0, y: 0, duration: 0.4, ease: 'power2.inOut' })
    }

    const scrollToSection = (sectionId: string) => {
        if (sectionId === 'top') {
            gsap.to(window, { scrollTo: { y: 0 }, duration: 1.5, ease: 'power3.inOut' })
        } else {
            const element = document.getElementById(sectionId)
            if (element) {
                gsap.to(window, { scrollTo: { y: element, offsetY: 0 }, duration: 1.5, ease: 'power3.inOut' })
            }
        }
    }

    const handleLinkClick = (sectionId: string) => {
        closeMenu(() => {
            setTimeout(() => scrollToSection(sectionId), 100)
        })
    }

    const handleLinkHover = (index: number, isEntering: boolean) => {
        const menuLinks = menuLinksRef.current
        if (!menuLinks) return
        const links = menuLinks.querySelectorAll('.menu-link')
        links.forEach((link, i) => {
            if (i === index) {
                gsap.to(link, { x: isEntering ? 24 : 0, duration: 0.8, ease: 'expo.out' })
            } else {
                gsap.to(link, { opacity: isEntering ? 0.18 : 1, duration: 0.8, ease: 'expo.out' })
            }
        })
    }

    const menuItems = [
        { label: 'Home', sectionId: 'top' },
        { label: 'Origins', sectionId: 'origins-section' },
        { label: 'Menu', sectionId: 'menu-section' },
        { label: 'Signature Bites', sectionId: 'signature-bites-section' },
        { label: 'Find Us', sectionId: 'map-section' },
    ]

    return (
        <>
            <header
                ref={headerRef}
                className="fixed top-0 left-0 w-full z-[100] gpu-layer"
                style={{ padding: '1.5rem 1.25rem', background: 'transparent' }}
            >
                {/* Logo dock — far left (morph target for hero logo GSAP) */}
                <div
                    id="navbar-logo-dock"
                    className="absolute left-5 md:left-10 lg:left-16 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ minWidth: '120px' }}
                />

                {/* Hamburger — true center */}
                <div className="flex justify-center">
                    <button
                        id="menu-button"
                        className="flex flex-col gap-[9px] w-10 group"
                        data-cursor-hover
                        onMouseEnter={() => handleMenuHover(true)}
                        onMouseLeave={() => handleMenuHover(false)}
                        onClick={isMenuOpen ? () => closeMenu() : openMenu}
                        aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
                    >
                        <span
                            ref={menuLine1Ref}
                            className="w-full h-[1.5px] transition-colors duration-700 origin-center"
                            style={{ backgroundColor: '#2E2B28' }}
                        />
                        <span
                            ref={menuLine2Ref}
                            className="w-full h-[1.5px] transition-colors duration-700 origin-center"
                            style={{ backgroundColor: '#2E2B28' }}
                        />
                    </button>
                </div>

                {/* AI Concierge CTA — absolute far right */}
                <button
                    onClick={() => setIsAIPanelOpen(true)}
                    className="absolute right-5 md:right-10 lg:right-16 top-1/2 -translate-y-1/2 group overflow-hidden flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500"
                    data-cursor-hover
                    aria-label="Habitat AI Concierge"
                    style={{
                        border: '1px solid rgba(200, 169, 106, 0.55)',
                        color: '#2E2B28',
                    }}
                >
                    {/* Gold fill on hover */}
                    <span
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'linear-gradient(135deg, #C8A96A 0%, #D4B87A 100%)',
                            transform: 'translateX(-101%)',
                            transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1)',
                        }}
                        aria-hidden
                        ref={el => {
                            if (el) {
                                el.closest('button')?.addEventListener('mouseenter', () => {
                                    el.style.transform = 'translateX(0)'
                                })
                                el.closest('button')?.addEventListener('mouseleave', () => {
                                    el.style.transform = 'translateX(-101%)'
                                })
                            }
                        }}
                    />
                    <Bot
                        className="relative z-10 w-3.5 h-3.5 group-hover:text-cream transition-colors duration-300"
                        strokeWidth={1.5}
                    />
                    <span
                        className="relative z-10 group-hover:text-cream transition-colors duration-300 hidden sm:inline"
                        style={{
                            fontFamily: 'var(--font-montserrat), "Inter", sans-serif',
                            fontSize: '0.6rem',
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            fontWeight: 400,
                        }}
                    >
                        AI Concierge
                    </span>
                </button>
            </header>

            {/* Full-Screen Menu Overlay — warm parchment with linen grain */}
            <div
                ref={overlayRef}
                className="fixed inset-0 z-[9999] hidden items-center justify-center section-cream"
                style={{ clipPath: 'circle(0% at 50% 10%)' }}
            >
                {/* Overlay top bar */}
                <div className="absolute top-0 left-0 w-full px-5 md:px-10 lg:px-16 py-6 flex items-center justify-between">
                    <p className="eyebrow opacity-60">Habitat Cafe</p>
                    <button
                        className="flex flex-col gap-[9px] w-10"
                        onClick={() => closeMenu()}
                        data-cursor-hover
                        aria-label="Close Menu"
                    >
                        <span className="w-full h-[1.5px] origin-center" style={{ backgroundColor: '#2E2B28', transform: 'rotate(45deg) translateY(5px)' }} />
                        <span className="w-full h-[1.5px] origin-center" style={{ backgroundColor: '#2E2B28', transform: 'rotate(-45deg) translateY(-5px)' }} />
                    </button>
                </div>

                {/* Navigation links */}
                <div ref={menuLinksRef} className="flex flex-col items-start gap-2 px-8 md:px-20 w-full max-w-2xl">
                    <p className="eyebrow mb-8 opacity-50">Navigate</p>
                    {menuItems.map((item, index) => (
                        <button
                            key={item.label}
                            className="menu-link text-left will-change-transform block"
                            style={{ transition: 'none' }}
                            onClick={() => handleLinkClick(item.sectionId)}
                            onMouseEnter={() => handleLinkHover(index, true)}
                            onMouseLeave={() => handleLinkHover(index, false)}
                            data-cursor-hover
                        >
                            <span
                                className="block"
                                style={{
                                    fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                                    fontSize: 'clamp(3.5rem, 8vw, 7rem)',
                                    fontWeight: 500,
                                    lineHeight: 1.05,
                                    letterSpacing: '-0.02em',
                                    color: '#2E2B28',
                                }}
                            >
                                {item.label}
                            </span>
                        </button>
                    ))}

                    {/* Footer info inside overlay */}
                    <div className="mt-16 flex items-center gap-6">
                        <span className="gold-divider" />
                        <p className="eyebrow opacity-40">Banjara Hills, Hyderabad</p>
                    </div>
                </div>

                {/* Decorative side number */}
                <div className="absolute right-8 md:right-16 bottom-12 text-right">
                    <p className="eyebrow opacity-20">Est. 2026</p>
                </div>
            </div>

            {/* Habitat AI Panel */}
            <HabitatAI isOpen={isAIPanelOpen} onClose={() => setIsAIPanelOpen(false)} />
        </>
    )
}
