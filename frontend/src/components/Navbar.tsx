'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar({ onCreateClick }: { onCreateClick: () => void }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [search, setSearch] = useState('');

    // Xử lý khi nhấn Enter trong ô tìm kiếm
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && search.trim() !== '') {
            router.push(`/search?query=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <h1
                    className="text-2xl font-bold text-blue-600 cursor-pointer"
                    onClick={() => router.push('/')}
                >
                    My Blog
                </h1>

                {/* Thanh tìm kiếm */}
                <div className="hidden sm:flex flex-1 mx-6">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                        className="w-full bg-gray-200 text-blue-600 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* Nút chức năng */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCreateClick}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        + Đăng bài
                    </button>

                    {session ? (
                        <>
                            <Image
                                src={session.user?.image || '/avatar.png'}
                                alt="User"
                                width={36}
                                height={36}
                                className="rounded-full cursor-pointer"
                                onClick={() => router.push('/profile')}
                            />
                            <button
                                onClick={() => signOut()}
                                className="text-gray-600 hover:text-red-500 transition"
                            >
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => router.push('/login')}
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Đăng nhập
                            </button>
                            <button
                                onClick={() => router.push('/register')}
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition"
                            >
                                Đăng ký
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
