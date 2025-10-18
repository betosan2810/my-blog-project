'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { X, Eye } from 'lucide-react';

export default function CreatePostPage() {
    const { data: session, status } = useSession({ required: true });
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [showPostPreview, setShowPostPreview] = useState(false); // 👈 xem preview bài viết
    const [selectedPreview, setSelectedPreview] = useState<string | null>(null); // 👈 xem preview ảnh

    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            setFiles(prev => [...prev, ...selectedFiles]);
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.accessToken) {
            setError("Authentication error. Please log in again.");
            return;
        }

        setIsUploading(true);
        setError('');
        const imageUrls: string[] = [];

        try {
            for (const file of files) {
                const sigResponse = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/media/sign-upload`,
                    {},
                    { headers: { 'Authorization': `Bearer ${session.accessToken}` } }
                );
                const { signature, timestamp, api_key } = sigResponse.data;

                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', api_key);
                formData.append('timestamp', timestamp);
                formData.append('signature', signature);

                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

                const cloudResponse = await axios.post(uploadUrl, formData);
                imageUrls.push(cloudResponse.data.secure_url);
            }

            const postPayload = { title, content, image_urls: imageUrls };
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/posts`,
                postPayload,
                { headers: { 'Authorization': `Bearer ${session.accessToken}` } }
            );

            router.push('/');
        } catch (err) {
            console.error("Upload or post failed:", err);
            setError("Upload or post failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    if (status === "loading") return <p>Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4 relative">
            {/* 🪄 Preview bài viết trước khi đăng */}
            {showPostPreview && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 relative overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setShowPostPreview(false)}
                            className="absolute top-3 right-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2"
                        >
                            <X size={18} />
                        </button>
                        <h2 className="text-3xl font-bold mb-4">{title || "Untitled Post"}</h2>
                        <p className="text-gray-700 whitespace-pre-line mb-4">{content || "(No content yet)"}</p>

                        {previews.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {previews.map((src, index) => (
                                    <Image
                                        key={index}
                                        src={src}
                                        alt={`preview-${index}`}
                                        width={400}
                                        height={300}
                                        className="rounded-lg object-cover border"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 🖼️ Xem preview ảnh riêng */}
            {selectedPreview && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
                    <div className="relative">
                        <Image
                            src={selectedPreview}
                            alt="Preview"
                            width={800}
                            height={600}
                            className="rounded-lg shadow-lg max-h-[90vh] object-contain"
                        />
                        <button
                            onClick={() => setSelectedPreview(null)}
                            className="absolute top-2 right-2 bg-white/80 text-black rounded-full p-2 hover:bg-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* 🧩 Form tạo bài viết */}
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl"
            >
                {/* ❌ Nút X góc trên cùng */}
                <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 hover:text-red-500 text-gray-600 rounded-full p-2 transition"
                    title="Cancel and return"
                >
                    <X size={20} />
                </button>
                <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">
                    📝 Create New Post
                </h1>

                {error && (
                    <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block font-medium mb-1 text-gray-700">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-green-400 focus:outline-none"
                        placeholder="Enter your post title..."
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-medium mb-1 text-gray-700">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={8}
                        className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-green-400 focus:outline-none"
                        placeholder="Write something interesting..."
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label className="block font-medium mb-1 text-gray-700">Upload Images</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0 file:font-semibold
                        file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                </div>

                {/* 📂 Danh sách file */}
                {files.length > 0 && (
                    <ul className="mb-6 border rounded-lg divide-y divide-gray-100">
                        {files.map((file, index) => (
                            <li key={index} className="flex justify-between items-center p-2">
                                <span className="truncate text-gray-700">{file.name}</span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPreview(previews[index])}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* 🔘 Nút hành động */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={() => setShowPostPreview(true)}
                        className="flex-1 py-3 bg-gray-200 text-gray-800 text-lg rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                        Preview Post
                    </button>
                    <button
                        type="submit"
                        disabled={isUploading}
                        className="flex-1 py-3 bg-green-600 text-white text-lg rounded-lg font-medium
                        hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'Uploading...' : 'Publish Post'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="flex-1 py-3 bg-red-100 text-red-700 text-lg rounded-lg font-medium hover:bg-red-200 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
