'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import LoginRequiredModal from '../components/LoginRequiredModal';

interface Post {
  id: number;
  title: string;
  content: string;
  author?: string;
  created_at?: string;
  image_urls?: string[];
}

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/posts');
        setPosts(res.data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleCreateClick = () => {
    if (session?.accessToken) router.push('/posts/create');
    else setShowLoginModal(true);
  };

  return (
    <>
      <Navbar onCreateClick={handleCreateClick} />

      <main className="max-w-2xl mx-auto mt-6 px-4 pb-10">
        {loading ? (
          <p className="text-center text-gray-500">Đang tải bài viết...</p>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">Chưa có bài viết nào.</p>
        )}
      </main>

      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}
    </>
  );
}
