'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Bước 1: Import thêm AxiosError và chính axios để sử dụng type guard
import axios from 'axios';

// Bước 2: Định nghĩa cấu trúc lỗi mà API Flask của bạn trả về
interface ApiErrorResponse {
    message: string;
}

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
                {
                    username,
                    email,
                    password,
                }
            );

            setSuccess('Registration successful! Redirecting to login...');

            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err) { // Bước 3: Bỏ `any` và xử lý lỗi bên trong
            // Sử dụng type guard của axios để kiểm tra xem đây có phải lỗi từ axios không
            if (axios.isAxiosError<ApiErrorResponse>(err)) {
                // Nếu là lỗi axios và có response từ server
                if (err.response && err.response.data && err.response.data.message) {
                    // Bây giờ TypeScript biết err.response.data có thể có thuộc tính 'message'
                    setError(err.response.data.message);
                } else {
                    // Lỗi mạng hoặc các lỗi axios không có response cụ thể
                    setError('A network or server error occurred. Please try again.');
                }
            } else {
                // Xử lý các lỗi không mong muốn khác (không phải từ axios)
                console.error("An unexpected error occurred:", err);
                setError('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="p-8 border rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4">Register</h1>

                {error && <p className="text-red-500 mb-4 bg-red-100 p-2 rounded">{error}</p>}
                {success && <p className="text-green-500 mb-4 bg-green-100 p-2 rounded">{success}</p>}

                {/* Phần còn lại của form giữ nguyên */}
                <div className="mb-4">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>
                <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">
                    Register
                </button>

                <p className="mt-4 text-center">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-500 hover:underline">
                        Login here
                    </Link>
                </p>
            </form>
        </div>
    );
}