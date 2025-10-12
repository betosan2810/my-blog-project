'use client'; // Đánh dấu đây là một Client Component

import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
// Định nghĩa kiểu dữ liệu cho Post
interface Post {
  id: number;
  title: string;
  content: string;
  image_url: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Địa chỉ API của Flask backend
        const response = await axios.get('http://127.0.0.1:5000/api/posts');
        setPosts(response.data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  if (loading) return <p>Loading...</p>;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">My Blog</h1>
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="p-4 border rounded-lg">
              <h2 className="text-2xl font-semibold">{post.title}</h2>
              <p>{post.content}</p>
              {post.image_url && (
                // Tạo một container cha để kiểm soát kích thước và bố cục của ảnh
                // Điều này rất quan trọng khi sử dụng thuộc tính `fill`
                <div className="relative mt-2 h-64 w-full max-w-sm overflow-hidden rounded-lg">
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill // Thuộc tính này làm cho ảnh lấp đầy kích thước của container cha
                    className="object-cover" // Giữ tỷ lệ ảnh mà không làm nó bị méo, tương đương object-fit: cover;
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No posts yet.</p>
        )}
      </div>
    </main>
  );
}