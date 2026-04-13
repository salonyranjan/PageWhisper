'use client';

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from './ui/button'
import { motion } from 'framer-motion'
import gsap from 'gsap'

const HeroSection = () => {
    const imgRef = useRef(null);

    useEffect(() => {
        if (imgRef.current) {
            gsap.to(imgRef.current, {
                y: -15,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        }
    }, []);

    return (
        <section className="wrapper mb-10 md:mb-16 animate-in fade-in duration-1000">
            {/* Main Container:
               Using 'grid-cols-1' for mobile and 'grid-cols-3' for desktop 
               to FORCE three distinct areas.
            */}
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-[#F4EFE6] border border-amber-100/50 shadow-sm min-h-[500px] flex flex-col justify-center">
                
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-amber-200/10 blur-[120px] pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-center w-full">
                    
                    {/* 1. LEFT COLUMN: Text & CTA */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
                        <h1 className="text-5xl font-serif italic tracking-tight text-slate-900 leading-tight">
                            PageWhisper
                        </h1>
                        <p className="text-lg text-slate-600 max-w-sm leading-relaxed">
                            Breathe life into your archives. Convert static PDFs into 
                            immersive, cinematic AI voice conversations.
                        </p>
                        
                        <div className="pt-2">
                            <Link href="/books/new">
                                <Button variant="cinematic" size="pill" className="px-10 py-6 text-lg shadow-xl">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Awake a New Book
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* 2. CENTER COLUMN: The Image (Forced visible via grid) */}
                    <div className="flex items-center justify-center min-h-[300px] md:min-h-[450px]">
                        <motion.div 
                            ref={imgRef}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative"
                        >
                            <Image
                                src="/assets/cinematic-books.png" 
                                alt="Cinematic AI Projector Illustration"
                                width={500}
                                height={500}
                                priority
                                className="object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.2)] scale-110 md:scale-125"
                            />
                        </motion.div>
                    </div>

                    {/* 3. RIGHT COLUMN: The Steps Card */}
                    <div className="flex justify-center md:justify-end">
                        <div className="w-full max-w-[320px] bg-white/90 backdrop-blur-md border border-amber-100/60 shadow-2xl rounded-2xl p-8 transform hover:translate-y-[-5px] transition-transform duration-500">
                            <ul className="space-y-8">
                                <li className="flex items-center gap-5">
                                    <div className="w-10 h-10 min-w-[40px] rounded-full border border-amber-200 flex items-center justify-center font-serif italic text-lg bg-amber-50 text-amber-900 shadow-sm">1</div>
                                    <div className="flex flex-col">
                                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-800">Upload PDF</h3>
                                        <p className="text-sm text-slate-500">Feed the archive</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-5">
                                    <div className="w-10 h-10 min-w-[40px] rounded-full border border-amber-200 flex items-center justify-center font-serif italic text-lg bg-amber-50 text-amber-900 shadow-sm">2</div>
                                    <div className="flex flex-col">
                                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-800">Synthesis</h3>
                                        <p className="text-sm text-slate-500">AI analyzes context</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-5">
                                    <div className="w-10 h-10 min-w-[40px] rounded-full border border-amber-200 flex items-center justify-center font-serif italic text-lg bg-amber-50 text-amber-900 shadow-sm">3</div>
                                    <div className="flex flex-col">
                                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-800">Whisper</h3>
                                        <p className="text-sm text-slate-500">Start voice chat</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default HeroSection