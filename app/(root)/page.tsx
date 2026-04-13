import React from 'react'
import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import { getAllBooks } from "@/lib/actions/book.actions";
import Search from "@/components/Search";

const Page = async ({ searchParams }: { searchParams: Promise<{ query?: string }> }) => {
    const { query } = await searchParams;

    const bookResults = await getAllBooks(query)
    const books = bookResults.success ? bookResults.data ?? [] : []

    return (
        <main className="wrapper container pb-20">
            {/* The Cinematic Hero */}
            <HeroSection />

            {/* Header Section with Refined Fonts */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-12 mt-10">
                <div className="space-y-1">
                    <h2 className="text-4xl font-serif italic text-[#1a1f2c] tracking-tight">
                        {query ? `Search results for "${query}"` : "The Archives"}
                    </h2>
                    <p className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-slate-400">
                        {books.length} Volumes Discovered
                    </p>
                </div>
                <Search />
            </div>

            {/* Books Grid */}
            <div className="library-books-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {books.map((book) => (
                    <BookCard 
                        key={book._id} 
                        title={book.title} 
                        author={book.author} 
                        coverURL={book.coverURL} 
                        slug={book.slug} 
                    />
                ))}
            </div>

            {/* Empty Search State */}
            {books.length === 0 && query && (
                <div className="text-center py-20">
                    <p className="font-serif italic text-2xl text-slate-400">
                        "No volumes found in this section of the archive..."
                    </p>
                </div>
            )}
        </main>
    )
}

export default Page