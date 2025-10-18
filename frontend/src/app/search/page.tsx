'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import PostCard from '../../components/PostCard';

interface Post {
    id: number;
    title: string;
    content: string;
    author?: string;
    created_at?: string;
    image_urls?: string[];
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || '';

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) return;

        const fetchPosts = async () => {
            setLoading(true);
            try {
                // Lấy toàn bộ bài viết rồi lọc theo query
                const res = await axios.get('http://127.0.0.1:5000/api/posts');
                const allPosts: Post[] = res.data;

                const filtered = allPosts.filter(
                    (post) =>
                        post.title?.toLowerCase().includes(query.toLowerCase()) ||
                        post.content?.toLowerCase().includes(query.toLowerCase())
                );

                setTimeout(() => {
                    setPosts(filtered);
                    setLoading(false);
                }, 300);
            } catch (error) {
                console.error('❌ Lỗi khi lấy dữ liệu bài viết:', error);
            } finally {
                setLoading(false);
            }
        };

        // Thêm delay nhỏ để tránh fetch liên tục khi người dùng đang gõ
        const delay = setTimeout(fetchPosts, 300);
        return () => clearTimeout(delay);
    }, [query]);

    return (
        <>
            <Navbar onCreateClick={() => { }} />

            <main className="max-w-2xl mx-auto mt-6 px-4 pb-10">
                <h2 className="text-2xl font-semibold mb-4">
                    🔍 Kết quả tìm kiếm cho: <span className="text-blue-600">{query}</span>
                </h2>

                {/* 🌀 Hiển thị khi đang tìm kiếm */}
                {loading ? (
                    <p className="text-center text-gray-400 italic mt-10 animate-pulse">
                        Đang tìm kiếm bài viết...
                    </p>
                ) : posts.length > 0 ? (
                    <div className="space-y-6 transition-opacity duration-200">
                        {posts.map((post) => (
                            <PostCard key={post.id} {...post} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mt-10">
                        Không tìm thấy bài viết nào phù hợp với &quot;{query}&quot;.
                    </p>
                )}
            </main>
        </>
    );
}
