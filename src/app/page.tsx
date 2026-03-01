'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PersistentNavbar from '@/components/PersistentNavbar'
import { emitMenuEnter, emitMenuLeave } from '@/components/CustomCursor'
import HabitatLoader from '@/components/HabitatLoader'
import { ChevronDown } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// ── SVG Placeholders (urban sanctuary palette)
const PlaceholderSVG = ({
    bg,
    accent,
    label,
    pattern = 'arch',
}: {
    bg: string
    accent: string
    label: string
    pattern?: 'arch' | 'plant' | 'grain' | 'grid'
}) => (
    <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0 }}
    >
        <rect width="100%" height="100%" fill={bg} />
        {pattern === 'arch' && (
            <>
                <ellipse cx="50%" cy="100%" rx="40%" ry="55%" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.35" />
                <ellipse cx="50%" cy="100%" rx="25%" ry="38%" fill="none" stroke={accent} strokeWidth="1" opacity="0.25" />
                <line x1="50%" y1="45%" x2="50%" y2="100%" stroke={accent} strokeWidth="1" opacity="0.2" />
            </>
        )}
        {pattern === 'plant' && (
            <>
                <path d="M50% 100% Q30% 70% 35% 45% Q40% 20% 50% 30% Q60% 20% 65% 45% Q70% 70% 50% 100%" fill={accent} opacity="0.18" />
                <path d="M50% 100% Q20% 75% 15% 55% Q10% 35% 30% 40%" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.25" />
                <path d="M50% 100% Q80% 75% 85% 55% Q90% 35% 70% 40%" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.25" />
            </>
        )}
        {pattern === 'grain' && (
            <>
                <rect width="100%" height="100%" fill={accent} opacity="0.05" />
                <line x1="0" y1="33%" x2="100%" y2="33%" stroke={accent} strokeWidth="0.5" opacity="0.2" />
                <line x1="0" y1="66%" x2="100%" y2="66%" stroke={accent} strokeWidth="0.5" opacity="0.2" />
            </>
        )}
        {pattern === 'grid' && (
            <>
                {[20, 40, 60, 80].map(x => (
                    <line key={x} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke={accent} strokeWidth="0.5" opacity="0.15" />
                ))}
                {[25, 50, 75].map(y => (
                    <line key={y} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke={accent} strokeWidth="0.5" opacity="0.15" />
                ))}
            </>
        )}
        <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="9"
            fontFamily="Inter, sans-serif"
            fontWeight="400"
            letterSpacing="3"
            fill={accent}
            opacity="0.4"
            style={{ textTransform: 'uppercase' }}
        >
            {label}
        </text>
    </svg>
)

// ── Menu categories data (Pinned Scrolling Menu)
const MENU_CATEGORIES = [
    {
        key: 'morning',
        label: 'THE MORNING RITUAL',
        bg: '#F5F5DC',
        accent: '#B67352',
        items: ['Pehelwan Paratha', 'Anda Ghotala Pav', 'Desi Nashta', 'Morning Chai'],
        imgUrls: [
            '/assets/images/pehelwan-paratha.jpg',
            '/assets/images/anda-ghotala-pav.jpg',
            '/assets/images/morning-nashta.jpg',
            '/assets/images/morning-chai.jpg',
        ],
    },
    {
        key: 'small',
        label: 'EARTH & GRAIN',
        bg: '#e7f5bdff',
        accent: '#4A5D4E',
        items: ['Pachimirchi Kodi', 'Why So Cheesy?', 'Small Plates', 'Sharing Bites'],
        imgUrls: [
            '/assets/images/pachimirchi-kodi.jpg',
            '/assets/images/cheese-balls.jpg',
            '/assets/images/grain-bowl.jpg',
            '/assets/images/sharing-bites.jpg',
        ],
    },
    {
        key: 'mains',
        label: 'THE MAIN EVENT',
        bg: '#E6EAE7',
        accent: '#3B4A3E',
        items: ['Railway Mutton Curry', 'Bolognese Pasta', 'Big Plates', 'Chef’s Special'],
        imgUrls: [
            '/assets/images/railway-mutton-curry.jpg',
            '/assets/images/pasta-hero.jpg',
            '/assets/images/big-plates.jpg',
            '/assets/images/chefs-special.jpg',
        ],
    },
    {
        key: 'brews',
        label: 'BOTANICAL BREWS',
        bg: '#f9e8ccff',
        accent: '#C8A96A',
        items: ['Matcha Rose Latte', 'Caribbean Cold Brew', 'Signature Pours', 'House Mocktails'],
        imgUrls: [
            '/assets/images/matcha-rose-latte.jpg',
            '/assets/images/caribbean-cold-brew.jpg',
            '/assets/images/pour-over-coffee.jpg',
            '/assets/images/iced-latte.jpg',
        ],
    },
]

// ── Tab-based menu data (4 real Habitat categories)
type MenuItem = { name: string; price: string; desc: string; svgBg: string; svgAccent: string; pattern: 'arch' | 'plant' | 'grain' | 'grid'; imgUrl: string }
const MENU_TABS: { key: string; label: string }[] = [
    { key: 'breakfast', label: 'The Morning Ritual' },
    { key: 'allday', label: 'Earth & Grain' },
    { key: 'mains', label: 'The Main Event' },
    { key: 'drinks', label: 'Botanical Brews' },
]
const MENU_TAB_DATA: Record<string, MenuItem[]> = {
    breakfast: [
        {
            name: 'Pehelwan Paratha — Chicken Kheema', price: '₹315',
            desc: 'Served with Safed Makkhan and Chutney.',
            svgBg: '#EDE5D8', svgAccent: '#8B5E3C', pattern: 'arch',
            imgUrl: '/assets/images/pehelwan-paratha.jpg',
        },
        {
            name: 'Anda Ghotala Pav', price: '₹285',
            desc: 'A savory, spiced egg scramble served with buttery pav.',
            svgBg: '#F0E8D8', svgAccent: '#B67352', pattern: 'grain',
            imgUrl: '/assets/images/anda-ghotala-pav.jpg',
        },
    ],
    allday: [
        {
            name: 'Pachimirchi Kodi', price: '₹375',
            desc: 'Tender chicken with green chilies, ghee, and a herby bath for regional flavor.',
            svgBg: '#DDE8DF', svgAccent: '#3B4A3E', pattern: 'plant',
            imgUrl: '/assets/images/pachimirchi-kodi.jpg',
        },
        {
            name: 'Why So Cheesy? Cheese Balls', price: '₹345',
            desc: 'Melty mozzarella, sharp cheddar, and rich Parmesan in a crispy golden crust.',
            svgBg: '#F2ECD8', svgAccent: '#9E7A32', pattern: 'grid',
            imgUrl: '/assets/images/cheese-balls.jpg',
        },
    ],
    mains: [
        {
            name: 'Railway Mutton Curry', price: '₹625',
            desc: 'Inspired by legendary railway canteens; slow-cooked with robust spices and potatoes.',
            svgBg: '#E8DACE', svgAccent: '#7A3B2E', pattern: 'arch',
            imgUrl: '/assets/images/railway-mutton-curry.jpg',
        },
        {
            name: 'Bolognese Pasta', price: '₹495',
            desc: 'Mutton kheema simmered with tomatoes, celery, and leeks, served with aromatic focaccia.',
            svgBg: '#EDE0D5', svgAccent: '#925C42', pattern: 'grain',
            imgUrl: '/assets/images/bolognese-pasta.jpg',
        },
    ],
    drinks: [
        {
            name: 'Matcha Rose Latte', price: '₹305',
            desc: 'A delicate fusion of floral rose and premium earthy matcha.',
            svgBg: '#E8EDE5', svgAccent: '#5C7A5A', pattern: 'plant',
            imgUrl: '/assets/images/matcha-rose-latte.jpg',
        },
        {
            name: 'Caribbean Cold Brew', price: '₹315',
            desc: 'A tropical, refreshing twist on our signature cold brew.',
            svgBg: '#E5DDD0', svgAccent: '#5C4A2E', pattern: 'grid',
            imgUrl: '/assets/images/caribbean-cold-brew.jpg',
        },
    ],
}

export default function Home() {
    const heroRef = useRef<HTMLDivElement>(null)
    const heroLogoRef = useRef<HTMLHeadingElement>(null)
    const stampRef = useRef<HTMLDivElement>(null)
    const bgTextRef = useRef<HTMLDivElement>(null)
    const aboutTextRef = useRef<HTMLDivElement>(null)
    const galleryRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const menuWrapperRef = useRef<HTMLDivElement>(null)
    const [selectedCategory, setSelectedCategory] = useState(0)
    const [loaderDone, setLoaderDone] = useState(false)
    // Imperative trigger for hero entrance — called directly by loader onWipeStart
    const heroAnimTriggerRef = useRef<(() => void) | null>(null)
    // Tab menu state
    const [activeTab, setActiveTab] = useState<string>('breakfast')
    // No React state for hover image — cursor events go directly to CustomCursor portal
    // via emitMenuEnter/Move/Leave (zero re-renders on mousemove)

    // ── Hero entrance: called imperatively by loader onWipeStart (no React delay)
    const triggerHeroAnimations = useCallback(() => {
        setLoaderDone(true) // still flip state so content renders
        const ctx = gsap.context(() => {
            const hero = heroRef.current
            const heroLogo = heroLogoRef.current
            if (!hero || !heroLogo) return

            const stamp = stampRef.current
            const bgText = bgTextRef.current
            const aboutText = aboutTextRef.current
            const gallery = galleryRef.current
            const menu = menuRef.current
            const menuWrapper = menuWrapperRef.current

            const mm = gsap.matchMedia()

            mm.add('(min-width: 769px)', () => {
                gsap.from(heroLogo, { y: 100, opacity: 0, duration: 1.6, ease: 'power4.out', delay: 0.05, force3D: true })
                gsap.fromTo(heroLogo,
                    { top: '44vh', left: '5vw', fontSize: '14vw', color: '#2E2B28', fontWeight: 600, zIndex: 50 },
                    { top: '1.6rem', left: '1.25rem', fontSize: '1.1rem', color: '#2E2B28', fontWeight: 500, zIndex: 100, ease: 'power1.out', force3D: true, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 20%', scrub: 1 } }
                )
                if (stamp) gsap.to(stamp, { y: -160, opacity: 0, force3D: true, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 60%', scrub: 1 } })
                if (bgText) gsap.to(bgText, { y: 280, opacity: 0, force3D: true, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } })
                if (aboutText) {
                    const lines = aboutText.querySelectorAll('[data-line]')
                    gsap.from(lines, { y: 100, opacity: 0, clipPath: 'inset(100% 0 0 0)', duration: 1.4, stagger: 0.1, ease: 'power4.out', force3D: true, scrollTrigger: { trigger: aboutText, start: 'top 70%', end: 'top 30%', toggleActions: 'play none none reverse' } })
                }
                if (gallery) {
                    gallery.querySelectorAll('.gallery-row').forEach(row => {
                        const imageWrapper = row.querySelector('.gallery-image') as HTMLElement
                        const innerImage = row.querySelector('img, .gallery-image-inner') as HTMLElement
                        const textBlock = row.querySelector('.gallery-text') as HTMLElement
                        const heading = row.querySelector('h3') as HTMLElement
                        const label = row.querySelector('[data-label]') as HTMLElement
                        const body = row.querySelector('[data-body]') as HTMLElement
                        if (imageWrapper && textBlock) {
                            // Chrome perf: remove filter:blur on scrub — causes GPU texture re-upload every frame
                            gsap.fromTo(imageWrapper, { y: 160, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 1.8, ease: 'expo.out', force3D: true, scrollTrigger: { trigger: row, start: 'top 75%', end: 'top 25%', scrub: 1.5 } })
                            if (innerImage) { gsap.set(innerImage, { scale: 1.2 }); gsap.to(innerImage, { y: -50, ease: 'none', force3D: true, scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: 2 } }) }
                            const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 68%', toggleActions: 'play none none reverse' } })
                            if (label) tl.fromTo(label, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', force3D: true })
                            if (heading) tl.fromTo(heading, { y: 70, opacity: 0, scale: 0.96, rotationX: 8 }, { y: 0, opacity: 1, scale: 1, rotationX: 0, duration: 1.2, ease: 'expo.out', force3D: true }, '-=0.6')
                            if (body) tl.fromTo(body, { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', force3D: true }, '-=0.7')
                            gsap.to(textBlock, { y: -28, ease: 'none', force3D: true, scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: 3 } })
                        }
                    })
                }
                if (menu && menuWrapper) {
                    const contentGroups = menu.querySelectorAll('.menu-content')
                    const sidebarItems = menu.querySelectorAll('.sidebar-item')
                    const menuTl = gsap.timeline({ scrollTrigger: { trigger: menuWrapper, start: 'top top', end: '+=500%', pin: true, scrub: 1 } })
                    MENU_CATEGORIES.forEach((cat, index) => {
                        const group = contentGroups[index]; if (!group) return
                        const title = group.querySelector('h2')
                        const cards = group.querySelectorAll('.menu-card')
                        const stepStart = index * 4
                        if (index > 0) { gsap.set(title, { opacity: 0, scale: 1.5, filter: 'blur(10px)' }); gsap.set(cards, { y: '150vh' }) }
                        else { gsap.set(title, { opacity: 0, y: 80 }); gsap.set(cards, { y: '150vh' }) }
                        menuTl.to(menu, { backgroundColor: cat.bg, duration: 2, ease: 'power2.inOut' }, stepStart)
                        menuTl.to(sidebarItems, { color: '#9CA3AF', fontWeight: 400, opacity: 0.4, scale: 1 }, stepStart)
                        menuTl.to(sidebarItems[index], { color: '#2E2B28', fontWeight: 700, opacity: 1, scale: 1.1 }, stepStart)
                        if (index === 0) menuTl.to(title, { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out' }, stepStart)
                        else menuTl.to(title, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power2.out' }, stepStart)
                        menuTl.to(cards[0], { y: '-150vh', duration: 4.5, ease: 'none' }, stepStart)
                        if (cards[1]) menuTl.to(cards[1], { y: '-150vh', duration: 5.5, ease: 'none' }, stepStart + 0.2)
                        if (cards[2]) menuTl.to(cards[2], { y: '-150vh', duration: 5, ease: 'none' }, stepStart + 0.5)
                        if (cards[3]) menuTl.to(cards[3], { y: '-150vh', duration: 4.8, ease: 'none' }, stepStart + 0.3)
                        if (index < MENU_CATEGORIES.length - 1) menuTl.to(title, { scale: 1.2, opacity: 0, filter: 'blur(15px)', duration: 1, ease: 'power1.in' }, stepStart + 3.5)
                        else { menuTl.to(title, { scale: 1.5, opacity: 0, filter: 'blur(20px)', duration: 1.5, ease: 'power2.in' }, stepStart + 3.5); menuTl.to(menu, { backgroundColor: '#F7F3EE', duration: 2, ease: 'power2.inOut' }, stepStart + 4) }
                    })
                }
            })

            mm.add('(max-width: 768px)', () => {
                gsap.from(heroLogo, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.05, force3D: true })
                gsap.fromTo(heroLogo,
                    { top: '38vh', left: '5vw', fontSize: '11vw', color: '#2E2B28', fontWeight: 600, zIndex: 50 },
                    { top: '1.6rem', left: '1.25rem', fontSize: '1rem', color: '#2E2B28', fontWeight: 500, zIndex: 100, ease: 'power1.out', force3D: true, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: 0.5 } }
                )
                if (bgText) gsap.to(bgText, { y: 100, opacity: 0, force3D: true, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5 } })
                if (aboutText) {
                    const lines = aboutText.querySelectorAll('[data-line]')
                    gsap.from(lines, { y: 50, opacity: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out', force3D: true, scrollTrigger: { trigger: aboutText, start: 'top 80%', toggleActions: 'play none none reverse' } })
                }
                if (gallery) {
                    gallery.querySelectorAll('.gallery-row').forEach(row => {
                        const imageWrapper = row.querySelector('.gallery-image') as HTMLElement
                        const textBlock = row.querySelector('.gallery-text') as HTMLElement
                        const heading = row.querySelector('h3') as HTMLElement
                        const label = row.querySelector('[data-label]') as HTMLElement
                        const body = row.querySelector('[data-body]') as HTMLElement
                        if (imageWrapper && textBlock) {
                            gsap.fromTo(imageWrapper, { y: 80, opacity: 0, scale: 0.93 }, { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power2.out', force3D: true, scrollTrigger: { trigger: row, start: 'top 80%', end: 'top 40%', scrub: 0.8 } })
                            const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 75%', toggleActions: 'play none none reverse' } })
                            if (label) tl.fromTo(label, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', force3D: true })
                            if (heading) tl.fromTo(heading, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', force3D: true }, '-=0.4')
                            if (body) tl.fromTo(body, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', force3D: true }, '-=0.5')
                        }
                    })
                }
            })

            // Scroll indicator pulse
            gsap.to('#scroll-indicator', { y: 12, duration: 1.6, repeat: -1, yoyo: true, ease: 'power1.inOut' })

            // ── Footer Mairu-style reveal: links stagger up, HABITAT slides from below
            ScrollTrigger.create({
                trigger: '#footer-section',
                start: 'top 90%',
                once: true,
                onEnter: () => {
                    // Stagger footer column headings + links
                    gsap.fromTo(
                        '#footer-section .footer-col-head, #footer-section .footer-link, #footer-section .footer-body',
                        { y: 28, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'power3.out', force3D: true }
                    )
                    // HABITAT title liquid rise
                    gsap.fromTo(
                        '#footer-habitat-text',
                        { y: 80, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1.6, delay: 0.2, ease: 'expo.out', force3D: true }
                    )
                },
            })

            const handleResize = () => ScrollTrigger.refresh()
            window.addEventListener('resize', handleResize)
            return () => { window.removeEventListener('resize', handleResize) }
        })
        heroAnimTriggerRef.current = null // prevent double-fire
        return () => ctx.revert()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Store trigger in ref so loader can call it without closure staleness
    useEffect(() => { heroAnimTriggerRef.current = triggerHeroAnimations }, [triggerHeroAnimations])


    return (
        <>
            {/* Preloader: onWipeStart fires hero instantly, onComplete unmounts */}
            {!loaderDone && (
                <HabitatLoader
                    onWipeStart={() => heroAnimTriggerRef.current?.()}
                    onComplete={() => setLoaderDone(true)}
                />
            )}
            <PersistentNavbar />

            {/* ══════════════════════════════════════════════════════════
                Content Wrapper — scrolls up to reveal fixed footer
            ══════════════════════════════════════════════════════════ */}
            <div id="content-wrapper" className="relative z-10 section-cream" style={{ marginBottom: '100vh' }}>

                {/* ── Hero ─────────────────────────────────────────────── */}
                <section
                    ref={heroRef}
                    className="relative h-screen w-full overflow-hidden"
                    style={{ backgroundColor: '#F7F3EE' }}
                >
                    {/* Grain overlay */}
                    <div
                        className="absolute inset-0 z-[1] pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'repeat',
                            opacity: 1,
                        }}
                    />

                    {/* Background BIG text — parallax */}
                    <div
                        ref={bgTextRef}
                        className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none select-none"
                    >
                        <h1
                            style={{
                                fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                                fontSize: 'clamp(12rem, 28vw, 38rem)',
                                fontWeight: 700,
                                color: '#2E2B28',
                                opacity: 0.04,
                                letterSpacing: '-0.04em',
                                lineHeight: 1,
                            }}
                        >
                            HABITAT
                        </h1>
                    </div>

                    {/* Fixed hero logo — morphs into navbar */}
                    <h1
                        ref={heroLogoRef}
                        className="fixed will-change-transform"
                        style={{
                            top: '44vh',
                            left: '5vw',
                            fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                            fontSize: '14vw',
                            fontWeight: 600,
                            color: '#2E2B28',
                            letterSpacing: '-0.035em',
                            lineHeight: 1,
                            zIndex: 50,
                        }}
                    >
                        Habitat
                    </h1>

                    {/* Stamp badge */}
                    <div
                        ref={stampRef}
                        className="absolute z-40"
                        style={{ bottom: '28vh', right: '18vw', transform: 'rotate(12deg)' }}
                    >
                        <div
                            className="w-20 h-20 rounded-full flex flex-col items-center justify-center"
                            style={{
                                border: '1px solid rgba(46, 43, 40, 0.25)',
                                background: 'rgba(247, 243, 238, 0.6)',
                                backdropFilter: 'blur(8px)',
                                padding: '0.75rem',
                            }}
                        >
                            <span style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>✦</span>
                            <p
                                className="eyebrow text-center leading-tight"
                                style={{ opacity: 0.6, fontSize: '0.5rem' }}
                            >
                                EST.<br />2024
                            </p>
                        </div>
                    </div>

                    {/* Bottom-right info card */}
                    <div
                        className="absolute z-40"
                        style={{ bottom: '2.5rem', right: '2.5rem', maxWidth: '160px' }}
                    >
                        <div
                            className="glass-card"
                            style={{ padding: '0.875rem 1rem' }}
                        >
                            <p
                                style={{
                                    fontFamily: 'var(--font-montserrat), "Inter", sans-serif',
                                    fontSize: '0.68rem',
                                    lineHeight: 1.7,
                                    color: '#706860',
                                    letterSpacing: '0.01em',
                                    fontWeight: 300,
                                }}
                            >
                                Where the neighbourhood gathers.
                                <br />
                                <span style={{ color: '#C8A96A', fontWeight: 400 }}>Banjara Hills, Hyderabad.</span>
                            </p>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div
                        id="scroll-indicator"
                        className="absolute z-10"
                        style={{ bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)' }}
                    >
                        <ChevronDown strokeWidth={1.2} style={{ width: '1.75rem', height: '1.75rem', color: '#9A8E84' }} />
                    </div>
                </section>

                {/* ── Section 1: Philosophy Reveal (with depth) ───────── */}
                <section
                    className="relative min-h-screen flex items-center section-padding overflow-hidden"
                    style={{ backgroundColor: '#F7F3EE' }}
                >
                    {/* Asymmetric side border – vertical gold rule */}
                    <div
                        className="absolute left-0 top-0 h-full pointer-events-none hidden md:block"
                        style={{ width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(200,169,106,0.3) 30%, rgba(200,169,106,0.3) 70%, transparent)', left: '6.5rem' }}
                    />
                    {/* Floating background glyph */}
                    <div
                        className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden md:block"
                        style={{ right: '-1rem' }}
                    >
                        <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(14rem,22vw,28rem)', fontWeight: 700, color: '#2E2B28', opacity: 0.04, lineHeight: 1, letterSpacing: '-0.05em' }}>φ</span>
                    </div>

                    <div className="max-w-5xl w-full">
                        {/* Eyebrow + gold dot */}
                        <div className="flex items-center gap-3 mb-10">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37', display: 'inline-block', flexShrink: 0 }} />
                            <p className="eyebrow opacity-90">Our Philosophy</p>
                        </div>

                        <div ref={aboutTextRef}>
                            {[
                                { text: 'A sanctuary', italic: false },
                                { text: 'where nature', italic: true },
                                { text: 'meets the', italic: false },
                                { text: 'neighbourhood.', italic: true },
                            ].map(({ text, italic }, i) => (
                                <span
                                    key={i}
                                    data-line
                                    className="block"
                                    style={{
                                        fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                                        fontSize: 'clamp(3.5rem, 8vw, 7.5rem)',
                                        fontWeight: italic ? 400 : 500,
                                        fontStyle: italic ? 'italic' : 'normal',
                                        lineHeight: 1.05,
                                        letterSpacing: '-0.025em',
                                        color: i === 1 ? '#C8A96A' : '#2E2B28',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {text}
                                </span>
                            ))}
                        </div>

                        {/* Subtext + tag grid */}
                        <div className="mt-14 grid md:grid-cols-2 gap-10 max-w-3xl">
                            <div className="flex items-start gap-5">
                                <span className="gold-divider mt-2 flex-shrink-0" style={{ width: 40 }} />
                                <p style={{ fontSize: '0.9rem', lineHeight: 1.9, color: '#706860', fontWeight: 300 }}>
                                    Born in the heart of Banjara Hills, Habitat embodies the timeless spirit of the neighbourhood Adda — where conversations flow as freely as the chai.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 content-start pt-1">
                                {['Urban Sanctuary', 'Organic', 'Slow Mornings', 'Community', 'Craft Coffee'].map(tag => (
                                    <span
                                        key={tag}
                                        style={{
                                            padding: '0.35rem 0.875rem',
                                            border: '1px solid rgba(200,169,106,0.35)',
                                            borderRadius: '999px',
                                            fontFamily: 'var(--font-montserrat)',
                                            fontSize: '0.58rem',
                                            letterSpacing: '0.2em',
                                            textTransform: 'uppercase',
                                            color: '#9A8E84',
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Section 2: Gallery / Origins ─────────────────────── */}
                <section
                    id="origins-section"
                    className="relative section-padding py-32 md:py-48"
                    style={{ backgroundColor: '#EEE8DF' }}
                >
                    <p className="eyebrow mb-20 text-center opacity-90">Our Origins</p>

                    <div ref={galleryRef} className="space-y-32 md:space-y-48 max-w-7xl mx-auto">
                        {/* Row 1 */}
                        <div className="gallery-row w-full flex flex-col md:flex-row items-center gap-12 md:gap-24">
                            <div className="gallery-image w-full md:w-5/12 aspect-[4/5] overflow-hidden will-change-transform relative shadow-2xl">
                                <div className="gallery-image-inner w-full h-full" style={{ position: 'relative' }}>
                                    <img
                                        src="/amb1.jpg"
                                        alt="Habitat cafe interior — minimalist and warm"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                            <div className="gallery-text w-full md:w-5/12 space-y-6 will-change-transform">
                                <p
                                    data-label
                                    style={{ fontFamily: 'var(--font-montserrat)', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C8A96A' }}
                                >
                                    The Beginning
                                </p>
                                <h3
                                    style={{
                                        fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                                        fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                                        fontWeight: 500,
                                        lineHeight: 1.08,
                                        letterSpacing: '-0.02em',
                                        color: '#2E2B28',
                                    }}
                                >
                                    Crafted for<br />the soulful.
                                </h3>
                                <p data-body style={{ fontSize: '0.9rem', lineHeight: 1.85, color: '#706860', fontWeight: 300, maxWidth: '38ch' }}>
                                    In Hyderabad's urban landscape, the Adda has always been more than just a meeting spot. It's a cultural institution, a sanctuary where friends become family.
                                </p>
                            </div>
                        </div>

                        {/* Row 2 (reversed) */}
                        <div className="gallery-row w-full flex flex-col-reverse md:flex-row items-center gap-12 md:gap-24">
                            <div className="gallery-text w-full md:w-5/12 space-y-6 md:text-right flex flex-col md:items-end will-change-transform">
                                <p
                                    data-label
                                    style={{ fontFamily: 'var(--font-montserrat)', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C8A96A' }}
                                >
                                    The Ambiance
                                </p>
                                <h3
                                    style={{
                                        fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                                        fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                                        fontWeight: 500,
                                        lineHeight: 1.08,
                                        letterSpacing: '-0.02em',
                                        color: '#2E2B28',
                                    }}
                                >
                                    Designed for<br />moments of pause.
                                </h3>
                                <p data-body style={{ fontSize: '0.9rem', lineHeight: 1.85, color: '#706860', fontWeight: 300, maxWidth: '38ch' }}>
                                    We've reimagined the classic Adda for the modern soul — preserving warmth and authenticity while infusing organic ingredients and sustainable practices.
                                </p>
                            </div>
                            <div className="gallery-image w-full md:w-5/12 aspect-[4/5] overflow-hidden will-change-transform relative shadow-2xl">
                                <div className="gallery-image-inner w-full h-full" style={{ position: 'relative' }}>
                                    <img
                                        src="/amb2.jpg"
                                        alt="Habitat cafe — lush terrace with architectural plants"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* ── Interactive Menu (Desktop — pinned) ──────────────── */}
                <div ref={menuWrapperRef} className="relative w-full hidden md:block" id="menu-section">
                    <section
                        ref={menuRef}
                        className="relative h-screen w-full flex items-center justify-center overflow-hidden z-20"
                        style={{ backgroundColor: '#F7F3EE' }}
                    >
                        {/* Sidebar labels */}
                        <div className="absolute right-8 md:right-14 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-7 text-right">
                            {MENU_CATEGORIES.map((cat, i) => (
                                <span
                                    key={cat.key}
                                    className={`sidebar-item transition-all duration-300`}
                                    style={{
                                        fontFamily: 'var(--font-montserrat), "Inter", sans-serif',
                                        fontSize: '0.6rem',
                                        letterSpacing: '0.2em',
                                        textTransform: 'uppercase',
                                        color: i === 0 ? '#2E2B28' : '#9CA3AF',
                                        fontWeight: i === 0 ? 700 : 400,
                                        opacity: i === 0 ? 1 : 0.4,
                                    }}
                                >
                                    {cat.label}
                                </span>
                            ))}
                        </div>

                        {MENU_CATEGORIES.map((cat, index) => (
                            <div
                                key={cat.key}
                                className="menu-content absolute inset-0 w-full h-full pointer-events-none"
                            >
                                {/* Category title */}
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <h2
                                        style={{
                                            fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                                            fontSize: 'clamp(6rem, 14vw, 16rem)',
                                            fontWeight: 500,
                                            color: '#2E2B28',
                                            opacity: index === 0 ? 1 : 1,
                                            lineHeight: 1,
                                            letterSpacing: '-0.03em',
                                        }}
                                    >
                                        {cat.label}
                                    </h2>
                                </div>

                                {/* 4 floating lifestyle image cards */}
                                {[
                                    { left: '8%', top: '-12%', w: '24vw', zIndex: 0 },
                                    { right: '8%', top: '-12%', w: '24vw', zIndex: 20 },
                                    { left: '8%', top: '35%', w: '24vw', zIndex: 20 },
                                    { right: '8%', top: '90%', w: '24vw', zIndex: 0 },
                                ].map((pos, i) => (
                                    <div
                                        key={i}
                                        className="menu-card will-change-transform absolute shadow-xl overflow-hidden"
                                        style={{
                                            ...pos,
                                            width: pos.w,
                                            aspectRatio: '3/4',
                                            position: 'absolute',
                                        }}
                                    >
                                        <img
                                            src={cat.imgUrls[i] || cat.imgUrls[0]}
                                            alt={cat.items[i] || cat.label}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            draggable={false}
                                        />
                                        {/* Subtle bottom overlay for readability */}
                                        <div
                                            className="absolute inset-0"
                                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)' }}
                                        />
                                        <p
                                            className="absolute bottom-3 left-3"
                                            style={{
                                                fontFamily: 'var(--font-montserrat), "Inter", sans-serif',
                                                fontSize: '0.5rem',
                                                letterSpacing: '0.2em',
                                                textTransform: 'uppercase',
                                                color: '#F7F3EE',
                                                opacity: 0.85,
                                            }}
                                        >
                                            {cat.items[i]}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </section>
                </div>{/* end menuWrapperRef div */}


                {/* ── LVER Marquee — between Pinned Menu & Tab Menu ──────── */}
                {/* CSS keyframes injected inline for glitch-free translateX(-50%) loop technique */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes lver-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                    @keyframes lver-marquee-rev { 0% { transform: translateX(-50%); } 100% { transform: translateX(0%); } }
                    .lver-run { animation: lver-marquee 22s linear infinite; }
                    .lver-run-rev { animation: lver-marquee-rev 14s linear infinite; }
                ` }} />
                <section
                    className="relative overflow-hidden py-0"
                    style={{ backgroundColor: '#F7F3EE' }}
                >
                    {/* Row 1: Habitat — gold, italic serif, large */}
                    <div className="w-full overflow-hidden">
                        <div className="flex whitespace-nowrap w-fit lver-run will-change-transform">
                            {/* Duplicate content for seamless loop */}
                            {[0, 1].map(copy => (
                                <span
                                    key={copy}
                                    style={{
                                        fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                                        fontSize: 'clamp(3rem, 18vw, 13rem)',
                                        fontWeight: 400,
                                        fontStyle: 'italic',
                                        lineHeight: 1,
                                        color: '#D4AF37',
                                        paddingRight: '4rem',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Habitat&nbsp;·&nbsp;Habitat&nbsp;·&nbsp;Habitat&nbsp;·&nbsp;Habitat&nbsp;·&nbsp;Habitat&nbsp;·&nbsp;
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Row 2: Urban Sanctuary descriptors in black */}
                    <div className="w-full overflow-hidden" style={{ marginTop: '-0.5%' }}>
                        <div className="flex whitespace-nowrap w-fit lver-run-rev will-change-transform">
                            {[0, 1].map(copy => (
                                <span
                                    key={copy}
                                    style={{
                                        fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                                        fontSize: 'clamp(3rem, 18vw, 13rem)',
                                        fontWeight: 400,
                                        fontStyle: 'italic',
                                        lineHeight: 1,
                                        color: '#2E2B28',
                                        paddingRight: '4rem',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Urban Sanctuary&nbsp;·&nbsp;Grounded&nbsp;·&nbsp;Organic&nbsp;·&nbsp;Craft Coffee&nbsp;·&nbsp;
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
                <section id="menu-section-mobile" className="block md:hidden section-padding py-24">
                    <p className="eyebrow mb-12 opacity-60">Our Menu</p>
                    <div className="space-y-16">
                        {MENU_CATEGORIES.map(cat => (
                            <div key={cat.key}>
                                <h3
                                    style={{
                                        fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                                        fontSize: '2.5rem',
                                        fontWeight: 500,
                                        color: '#2E2B28',
                                        letterSpacing: '-0.02em',
                                        marginBottom: '1.5rem',
                                    }}
                                >
                                    {cat.label}
                                </h3>
                                <div className="space-y-0">
                                    {cat.items.map(item => (
                                        <div key={item} style={{ padding: '0.875rem 0', borderBottom: '1px solid rgba(200, 169, 106, 0.18)' }}>
                                            <p style={{ fontSize: '0.85rem', color: '#706860', fontWeight: 300, letterSpacing: '0.01em' }}>{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Interactive Menu — LVER Tab System ───────────────── */}
                <section
                    id="signature-bites-section"
                    className="section-padding py-24 md:py-36"
                    style={{ backgroundColor: '#F7F3EE' }}
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-12 flex-wrap gap-6">
                            <div>
                                <p className="eyebrow mb-2 opacity-60">Our Menu</p>
                                <h2 style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 500, letterSpacing: '-0.02em', color: '#2E2B28' }}>
                                    What we serve
                                </h2>
                            </div>
                            {/* Tab Pills */}
                            <div className="flex gap-2">
                                {MENU_TABS.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        data-cursor-hover
                                        style={{
                                            padding: '0.5rem 1.25rem',
                                            borderRadius: '999px',
                                            border: activeTab === tab.key ? '1px solid #D4AF37' : '1px solid rgba(46,43,40,0.18)',
                                            background: activeTab === tab.key ? '#D4AF37' : 'transparent',
                                            color: activeTab === tab.key ? '#F7F3EE' : '#706860',
                                            fontFamily: 'var(--font-montserrat), "Inter", sans-serif',
                                            fontSize: '0.62rem',
                                            letterSpacing: '0.2em',
                                            textTransform: 'uppercase',
                                            fontWeight: 400,
                                            transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Menu Items — LVER hover image style */}
                        <div className="space-y-0">
                            {MENU_TAB_DATA[activeTab].map((item, i) => (
                                <div
                                    key={`${activeTab}-${i}`}
                                    className="signature-item group relative"
                                    style={{ cursor: 'none' }}
                                    onMouseEnter={e => {
                                        // Emit enter event to CustomCursor portal — pure DOM, zero React re-render
                                        emitMenuEnter(item.imgUrl)
                                    }}
                                    onMouseLeave={() => emitMenuLeave()}
                                >
                                    <div className="gold-divider-full" />
                                    <div className="flex justify-between items-center py-7 group-hover:pl-4 transition-all duration-500">
                                        <div>
                                            <h3
                                                style={{
                                                    fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                                                    fontSize: 'clamp(1.6rem, 4vw, 3.2rem)',
                                                    fontWeight: 400,
                                                    letterSpacing: '-0.01em',
                                                    color: '#2E2B28',
                                                    transition: 'color 0.4s ease',
                                                }}
                                                className="group-hover:text-terracotta-600"
                                            >
                                                {item.name}
                                            </h3>
                                            <p style={{ fontSize: '0.72rem', color: '#9A8E84', fontWeight: 300, marginTop: '0.3rem', letterSpacing: '0.01em' }}>{item.desc}</p>
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.1rem', fontStyle: 'italic', color: '#C8A96A', flexShrink: 0, marginLeft: '1.5rem' }}>{item.price}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="gold-divider-full" />
                        </div>
                    </div>
                </section>

                {/* ── Map ─────────────────────────────────────────────── */}
                <section id="map-section" className="h-[560px] relative overflow-hidden">
                    <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'rgba(59, 74, 62, 0.08)', mixBlendMode: 'multiply' }} />
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.804623694048!2d78.44050957639116!3d17.421161383471812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9713ea5dce4d%3A0x55d66161e9f00e11!2sHabitat%20Cafe!5e0!3m2!1sen!2sin!4v1772193837992!5m2!1sen!2sin"
                        height="100%"
                        width="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Habitat Cafe — Banjara Hills, Hyderabad"
                    />
                </section>

            </div>{/* end content-wrapper */}


            {/* ══ Mairu-style Fixed Footer ════════════════════════════════════
                Fixed behind content; revealed as content wrapper scrolls away
            ═══════════════════════════════════════════════════════════ */}
            <footer
                id="footer-section"
                className="fixed bottom-0 left-0 w-full h-screen flex flex-col overflow-hidden z-0"
                style={{ backgroundColor: '#0A0908', borderTop: '1px solid rgba(200,169,106,0.08)' }}
            >

                {/* Ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{ width: '900px', height: '420px', background: 'radial-gradient(ellipse at top, rgba(200,169,106,0.07) 0%, transparent 70%)', opacity: 0.5 }} />

                {/* ── Inner shell: tight flex column, no wasted space */}
                <div className="relative z-10 flex flex-col h-full w-full max-w-[1600px] mx-auto section-padding pt-8 md:pt-10 pb-0">

                    {/* ─── 3-Column Link Grid ───────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 mb-5 md:mb-8">

                        {/* Explore */}
                        <div>
                            <h4 className="footer-col-head">Explore</h4>
                            <nav className="flex flex-col gap-[0.85rem]">
                                {[
                                    { label: 'Home', id: 'top' },
                                    { label: 'Origins', id: 'origins-section' },
                                    { label: 'Our Menu', id: 'menu-section' },
                                    { label: 'Find Us', id: 'map-section' },
                                ].map(link => (
                                    <a key={link.label} href={`#${link.id}`} data-cursor-hover className="footer-link group relative inline-block">
                                        {link.label}
                                        <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-300" style={{ background: '#C8A96A', opacity: 0.45 }} />
                                    </a>
                                ))}
                            </nav>
                        </div>

                        {/* Connect */}
                        <div>
                            <h4 className="footer-col-head">Connect</h4>
                            <nav className="flex flex-col gap-[0.85rem]">
                                {[
                                    { label: 'Instagram', href: 'https://instagram.com' },
                                    { label: 'Facebook', href: 'https://facebook.com' },
                                    { label: 'Swiggy', href: '#' },
                                    { label: 'Zomato', href: '#' },
                                ].map(link => (
                                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" data-cursor-hover className="footer-link group relative inline-block">
                                        {link.label}
                                        <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-300" style={{ background: '#C8A96A', opacity: 0.45 }} />
                                    </a>
                                ))}
                            </nav>
                        </div>

                        {/* Visit */}
                        <div>
                            <h4 className="footer-col-head">Visit</h4>
                            <div className="footer-body space-y-3">
                                <p>Banjara Hills, Hyderabad<br />Telangana, India — 500034</p>
                                <p>Mon – Sun<br />8:00 AM – 1:00 AM</p>
                                <a href="mailto:hello@habitatcafe.in" data-cursor-hover
                                    style={{ fontFamily: 'var(--font-playfair),"Playfair Display",serif', fontStyle: 'italic', fontSize: '0.95rem', color: '#C8A96A', fontWeight: 400, display: 'block', marginTop: '0.5rem' }}>
                                    hello@habitatcafe.in
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* ─── Hairline divider + legal ─────────────────────── */}
                    <div
                        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-4 md:pb-5"
                        style={{ borderTop: '1px solid rgba(247,243,238,0.06)', paddingTop: '1rem' }}
                    >
                        <p style={{ fontFamily: 'var(--font-montserrat),"Inter",sans-serif', fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(247,243,238,0.2)' }}>
                            © 2026 Habitat Cafe · All rights reserved
                        </p>
                        <div className="flex gap-5">
                            {['Privacy Policy', 'Terms of Use'].map(item => (
                                <a key={item} href="#"
                                    style={{ fontFamily: 'var(--font-montserrat),"Inter",sans-serif', fontSize: '0.54rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,243,238,0.2)', transition: 'color 0.3s ease' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#C8A96A' }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(247,243,238,0.2)' }}
                                >{item}</a>
                            ))}
                        </div>
                    </div>

                    {/* ─── Massive HABITAT wordmark ─────────────────────── */}
                    {/* flex-1 anchors wordmark to fill remaining height; items-end */}
                    {/* keeps it flush against the footer bottom edge               */}
                    <div className="flex-1 flex items-end pointer-events-none overflow-hidden">
                        <h2
                            id="footer-habitat-text"
                            className="select-none w-full text-center"
                            style={{
                                fontFamily: 'var(--font-playfair),"Playfair Display",serif',
                                fontSize: 'clamp(6rem, 19vw, 24rem)',
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                lineHeight: 0.82,
                                // Mairu-style: outline text with a hint of fill for depth
                                color: 'transparent',
                                WebkitTextStroke: '0.5px #c8a96a66',
                                whiteSpace: 'nowrap',
                                willChange: 'transform, opacity',
                            }}
                        >
                            HABITAT
                        </h2>
                    </div>

                </div>
            </footer>
        </>
    )
}

