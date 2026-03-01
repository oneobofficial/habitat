'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles } from 'lucide-react'
import gsap from 'gsap'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface HabitatAIProps {
    isOpen: boolean
    onClose: () => void
}

export default function HabitatAI({ isOpen, onClose }: HabitatAIProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Namaste! Welcome to Habitat Cafe. I'm here to help you discover our menu, find the perfect spot, or answer any questions about your visit. How can I make your experience special today?",
        },
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen && panelRef.current) {
            gsap.fromTo(
                panelRef.current,
                { x: '100%', opacity: 0 },
                { x: '0%', opacity: 1, duration: 0.55, ease: 'power3.out' }
            )
        }
    }, [isOpen])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return
        const userMessage: Message = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        setTimeout(() => {
            const responses = [
                "Our Pistachio Latte is absolutely divine — freshly ground pistachios with perfectly steamed milk. Would you like to know about our food pairings?",
                "For a romantic evening, I highly recommend our rooftop seating. The sunset views over Banjara Hills are breathtaking.",
                "If you're looking for a productive work session, our quiet indoor corners near the window are ideal. Natural light, comfortable seating, and unlimited refills!",
                "Our Hyderabad Fusion Bowl is a local favourite — traditional Hyderabadi spices meet modern continental flavours.",
                "We open at 8 AM for early birds. Our Continental breakfast spread is available until noon. Would you like to know what's included?",
                "The Smashed Avocado Toast is perfect for brunch — locally sourced sourdough topped with cherry tomatoes, feta, and house-made chili oil.",
                "Our Forest Plates celebrate local, seasonal produce. Think herb-roasted vegetables, heirloom grains, and wild herb dressings.",
            ]
            const randomResponse = responses[Math.floor(Math.random() * responses.length)]
            setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }])
            setIsLoading(false)
        }, 1000)
    }

    const handleClose = () => {
        if (panelRef.current) {
            gsap.to(panelRef.current, {
                x: '100%',
                opacity: 0,
                duration: 0.4,
                ease: 'power3.in',
                onComplete: onClose,
            })
        } else {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9998]"
                style={{ background: 'rgba(46, 43, 40, 0.25)', backdropFilter: 'blur(6px)' }}
                onClick={handleClose}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className="fixed top-0 right-0 h-full w-full md:w-[460px] z-[9999] flex flex-col"
                style={{
                    background: 'rgba(247, 243, 238, 0.96)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderLeft: '1px solid rgba(224, 216, 204, 0.75)',
                    boxShadow: '-8px 0 48px rgba(46, 43, 40, 0.08)',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-7 py-6"
                    style={{ borderBottom: '1px solid rgba(200, 169, 106, 0.18)' }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #C8A96A 0%, #D4B87A 100%)' }}
                        >
                            <Sparkles className="w-4 h-4" style={{ color: '#F7F3EE' }} />
                        </div>
                        <div>
                            <h2
                                className="text-xl"
                                style={{
                                    fontFamily: 'var(--font-playfair), "Playfair Display", serif',
                                    fontWeight: 500,
                                    color: '#2E2B28',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                Habitat AI
                            </h2>
                            <p className="eyebrow mt-0.5 opacity-50">Your friendly concierge</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
                        data-cursor-hover
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" style={{ color: '#706860' }} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className="max-w-[82%] rounded-2xl px-5 py-3.5"
                                style={
                                    message.role === 'user'
                                        ? {
                                            background: '#C8A96A',
                                            color: '#000000ff',
                                        }
                                        : {
                                            background: 'rgba(248, 245, 240, 0.9)',
                                            color: '#2E2B28',
                                            border: '1px solid rgba(200, 169, 106, 0.2)',
                                        }
                                }
                            >
                                <p
                                    style={{
                                        fontFamily: 'var(--font-montserrat), "Inter", sans-serif',
                                        fontSize: '0.8rem',
                                        lineHeight: '1.7',
                                        fontWeight: 300,
                                    }}
                                >
                                    {message.content}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div
                                className="rounded-2xl px-5 py-4"
                                style={{
                                    background: 'rgba(248, 245, 240, 0.9)',
                                    border: '1px solid rgba(200, 169, 106, 0.2)',
                                }}
                            >
                                <div className="flex gap-1.5">
                                    {[0, 150, 300].map(delay => (
                                        <div
                                            key={delay}
                                            className="w-2 h-2 rounded-full animate-bounce"
                                            style={{ backgroundColor: '#C8A96A', animationDelay: `${delay}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div
                    className="px-7 py-5"
                    style={{ borderTop: '1px solid rgba(224, 216, 204, 0.6)' }}
                >
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about menu, seating, or anything..."
                            className="flex-1 px-5 py-3 rounded-full focus:outline-none transition-all duration-300"
                            style={{
                                background: 'rgba(248, 245, 240, 0.9)',
                                border: '1px solid rgba(224, 216, 204, 0.75)',
                                fontFamily: 'var(--font-montserrat), "Inter", sans-serif',
                                fontSize: '0.78rem',
                                fontWeight: 300,
                                color: '#2E2B28',
                            }}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-40 transition-all duration-300 hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #C8A96A 0%, #D4B87A 100%)' }}
                            data-cursor-hover
                        >
                            <Send className="w-4 h-4" style={{ color: '#F7F3EE' }} />
                        </button>
                    </div>
                    <p
                        className="text-center mt-3 opacity-40"
                        style={{
                            fontFamily: 'var(--font-montserrat), "Inter", sans-serif',
                            fontSize: '0.6rem',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: '#706860',
                        }}
                    >
                        Powered by Habitat AI
                    </p>
                </div>
            </div>
        </>
    )
}
