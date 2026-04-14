'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, ImageIcon } from 'lucide-react';
import { UploadSchema } from '@/lib/zod';
import { BookUploadFormValues } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ACCEPTED_PDF_TYPES, ACCEPTED_IMAGE_TYPES } from '@/lib/constants';
import FileUploader from './FileUploader';
import VoiceSelector from './VoiceSelector';
import LoadingOverlay from './LoadingOverlay';
import { useAuth } from "@clerk/nextjs";
import { toast } from 'sonner';
import { checkBookExists, createBook, saveBookSegments } from "@/lib/actions/book.actions";
import { useRouter } from "next/navigation";
import { parsePDFFile } from "@/lib/utils";
import { upload } from "@vercel/blob/client";

const UploadForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm<BookUploadFormValues>({
        resolver: zodResolver(UploadSchema),
        defaultValues: {
            title: '',
            author: '',
            persona: '',
            pdfFile: undefined,
            coverImage: undefined,
        },
    });

    const uploadFile = async (fileName: string, file: File): Promise<{ url: string; pathname: string }> => {
        console.log('🚀 Uploading:', fileName, file.type, file.size);
        
        try {
            const result = await upload(fileName, file, {
                access: 'public',
                handleUploadUrl: '/api/upload',  // ✅ No 'as any' needed
            });
            console.log('✅ Upload success:', result.url);
            return result;
        } catch (error) {
            console.error('❌ Upload failed:', error);
            throw new Error(`Failed to upload ${fileName}: ${error}`);
        }
    };

    const onSubmit = async (data: BookUploadFormValues) => {
        if (!userId) {
            return toast.error("Please login to upload books");
        }

        setIsSubmitting(true);

        try {
            console.log('📚 Starting book upload process...');

            // 1. Check if book exists
            const existsCheck = await checkBookExists(data.title);
            if (existsCheck.exists && existsCheck.book) {
                toast.info("A book with this title already exists.");
                form.reset();
                router.push(`/books/${existsCheck.book.slug}`);
                return;
            }

            const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
            const pdfFile = data.pdfFile!;

            // 2. Parse PDF for Content & Auto-Generated Cover
            console.log('📄 Parsing PDF...');
            const parsedPDF = await parsePDFFile(pdfFile);

            if (!parsedPDF || parsedPDF.content.length === 0) {
                toast.error("Failed to parse PDF. Please try a different file.");
                return;
            }

            // 3. Upload PDF to Vercel Blob
            console.log('☁️ Uploading PDF...');
            const uploadedPdfBlob = await uploadFile(`${fileTitle}.pdf`, pdfFile);

            let coverUrl: string;

            // 4. Handle Cover Image Upload
            if (data.coverImage) {
                console.log('🖼️ Uploading custom cover...');
                const coverFile = data.coverImage;
                const uploadedCoverBlob = await uploadFile(`${fileTitle}-cover`, coverFile);
                coverUrl = uploadedCoverBlob.url;
            } else {
                // Auto-generate cover from PDF first page
                console.log('🎨 Generating cover from PDF...');
                const response = await fetch(parsedPDF.cover);
                if (!response.ok) throw new Error('Failed to fetch PDF cover');
                
                const blob = await response.blob();
                const coverFile = new File([blob], `${fileTitle}-cover.png`, { type: 'image/png' });
                
                const uploadedCoverBlob = await uploadFile(`${fileTitle}-cover.png`, coverFile);
                coverUrl = uploadedCoverBlob.url;
            }

            // 5. Create Book Record in MongoDB
            console.log('💾 Creating book record...');
            const book = await createBook({
                clerkId: userId,
                title: data.title,
                author: data.author,
                persona: data.persona,
                fileURL: uploadedPdfBlob.url,
                fileBlobKey: uploadedPdfBlob.pathname,
                coverURL: coverUrl,
                fileSize: pdfFile.size,
            });

            if (!book.success) {
                toast.error(book.error as string || "Failed to create book");
                if (book.isBillingError) router.push("/subscriptions");
                return;
            }

            // 6. Save RAG Segments
            console.log('🔗 Processing RAG segments...');
            const segments = await saveBookSegments(book.data._id, userId, parsedPDF.content);

            if (!segments.success) {
                throw new Error("Failed to save book segments");
            }

            toast.success("Synthesis complete! Opening your archives.");
            form.reset();
            router.push('/');
            
        } catch (error) {
            console.error("💥 Full upload error:", error);
            toast.error("Upload failed. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) return null;

    return (
        <>
            {isSubmitting && <LoadingOverlay />}

            <div className="new-book-wrapper">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FileUploader
                            control={form.control}
                            name="pdfFile"
                            label="Book PDF File"
                            acceptTypes={ACCEPTED_PDF_TYPES}
                            icon={Upload}
                            placeholder="Click to upload PDF"
                            hint="PDF file (max 50MB)"
                            disabled={isSubmitting}
                        />

                        <FileUploader
                            control={form.control}
                            name="coverImage"
                            label="Cover Image (Optional)"
                            acceptTypes={ACCEPTED_IMAGE_TYPES}
                            icon={ImageIcon}
                            placeholder="Click to upload cover"
                            hint="Leave empty to auto-generate from PDF"
                            disabled={isSubmitting}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="form-input"
                                            placeholder="ex: The Great Gatsby"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="author"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Author</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="form-input"
                                            placeholder="ex: F. Scott Fitzgerald"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="persona"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Assistant Voice</FormLabel>
                                    <FormControl>
                                        <VoiceSelector
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="form-btn" disabled={isSubmitting}>
                            Begin Synthesis
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    );
};

export default UploadForm;