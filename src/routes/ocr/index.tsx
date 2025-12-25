import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Sparkles, FileText, ExternalLink } from 'lucide-react';
import { ImageUpload } from './components/imageUpload';
import { ResultDisplay } from './components/resultDisplay';
import type { ImageFile } from '@/types';
import { analyzeImage } from '@/services/ocr';

export const OCR: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progressStatus, setProgressStatus] = useState<string>('');
    const [progressValue, setProgressValue] = useState<number>(0);
    const [result, setResult] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleImageSelect = (image: ImageFile | null) => {
        setSelectedImage(image);
        setResult('');
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        setProgressStatus('Initializing engine...');
        setProgressValue(0);
        setError(null);
        setResult('');

        try {
            const text = await analyzeImage(
                selectedImage.base64,
                selectedImage.mimeType,
                (status, progress) => {
                    // Format status string to be more readable (e.g., "loading_tessdata" -> "Loading Tessdata")
                    const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    setProgressStatus(formattedStatus);
                    setProgressValue(progress);
                }
            );
            setResult(text);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsAnalyzing(false);
            setProgressStatus('');
            setProgressValue(0);
        }
    };

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">

            {/* Main Content */}
            <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="mb-8 text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">
                        Convert Images to Text
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Upload a document, screenshot, or handwritten note to instantly extract the text using on-device OCR.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Input */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-800">Upload Image</h3>
                                {selectedImage && (
                                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                        Ready to Extract
                                    </span>
                                )}
                            </div>
                            <ImageUpload
                                onImageSelected={handleImageSelect}
                                selectedImage={selectedImage}
                                disabled={isAnalyzing}
                            />

                            <button
                                onClick={handleAnalyze}
                                disabled={!selectedImage || isAnalyzing}
                                className={`
                  mt-6 w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2
                  ${!selectedImage || isAnalyzing
                                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
                                    }
                `}
                            >
                                {isAnalyzing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <FileText size={18} />
                                        Extract Text
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Output */}
                    <div className="flex flex-col h-full min-h-[500px]">
                        <ResultDisplay
                            result={result}
                            loading={isAnalyzing}
                            progressStatus={progressStatus}
                            progressValue={progressValue}
                            onCopy={handleCopy}
                            onRetry={handleAnalyze}
                            error={error}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export const Route = createFileRoute('/ocr/')({
    component: OCR,
})