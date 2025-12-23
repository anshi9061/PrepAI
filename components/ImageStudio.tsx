import React, { useState, useRef } from 'react';
import { generateConceptImage, editStudyImage } from '../services/geminiService';
import { Image, Wand2, Upload, Eraser } from 'lucide-react';

const ImageStudio: React.FC = () => {
    const [mode, setMode] = useState<'GENERATE' | 'EDIT'>('GENERATE');
    const [prompt, setPrompt] = useState('');
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [resolution, setResolution] = useState<'1K' | '2K'>('1K');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        try {
            const base64 = await generateConceptImage(prompt, resolution);
            if (base64) setImageSrc(base64);
        } catch (e) {
            alert('Generation failed. Check API Key.');
        }
        setIsLoading(false);
    };

    const handleEdit = async () => {
        if (!prompt || !imageSrc) return;
        setIsLoading(true);
        try {
             // For edit, we assume imageSrc is base64 string
            const result = await editStudyImage(imageSrc, prompt);
            if (result) setImageSrc(result);
        } catch (e) {
             alert('Edit failed.');
        }
        setIsLoading(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result as string);
                setMode('EDIT'); // Switch to edit mode automatically
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
             <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-display font-bold mb-2">Visual Studio</h1>
                <p className="opacity-90">Create diagrams or edit your study notes with AI.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="md:col-span-1 glass-panel p-6 rounded-2xl h-fit">
                    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                        <button 
                            onClick={() => setMode('GENERATE')}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'GENERATE' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Generate
                        </button>
                        <button 
                             onClick={() => setMode('EDIT')}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'EDIT' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Edit
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={mode === 'GENERATE' ? "E.g., A detailed diagram of a plant cell..." : "E.g., Add labels to the mitochondria..."}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none h-32 resize-none text-sm"
                            />
                        </div>

                        {mode === 'GENERATE' && (
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
                                <div className="flex gap-2">
                                    {['1K', '2K'].map((res) => (
                                        <button 
                                            key={res}
                                            onClick={() => setResolution(res as '1K'|'2K')}
                                            className={`px-3 py-1 rounded-lg text-sm border ${resolution === res ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600'}`}
                                        >
                                            {res}
                                        </button>
                                    ))}
                                </div>
                             </div>
                        )}

                        {mode === 'EDIT' && !imageSrc && (
                             <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors"
                            >
                                <Upload className="mx-auto text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Upload Image to Edit</span>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                             </div>
                        )}

                        <button 
                            onClick={mode === 'GENERATE' ? handleGenerate : handleEdit}
                            disabled={isLoading || !prompt || (mode === 'EDIT' && !imageSrc)}
                            className="w-full py-3 bg-pink-600 text-white rounded-xl font-bold shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <Wand2 size={18} />
                                    <span>{mode === 'GENERATE' ? 'Generate' : 'Apply Edit'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Canvas/Preview */}
                <div className="md:col-span-2 glass-panel p-6 rounded-2xl flex items-center justify-center min-h-[400px] bg-gray-50/50 relative overflow-hidden">
                    {imageSrc ? (
                        <div className="relative group w-full h-full flex items-center justify-center">
                            <img src={imageSrc} alt="Generated result" className="max-w-full max-h-[500px] rounded-lg shadow-sm object-contain" />
                            {mode === 'EDIT' && (
                                <button 
                                    onClick={() => setImageSrc(null)}
                                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Eraser size={16} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <Image size={48} className="mx-auto mb-3 opacity-30" />
                            <p>Result will appear here</p>
                        </div>
                    )}
                </div>
             </div>
        </div>
    )
}

export default ImageStudio;