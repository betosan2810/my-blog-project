'use client';
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ImageModal from "./ImageModal";

interface PostCardProps {
    id: number;
    title: string;
    content: string;
    author?: string;
    created_at?: string;
    image_urls?: string[];
    user_id?: number; // thêm để gửi khi reaction
}

const reactionsList = [
    { emoji: "👍", label: "Thích" },
    { emoji: "❤️", label: "Yêu thích" },
    { emoji: "😂", label: "Haha" },
    { emoji: "😢", label: "Buồn" },
    { emoji: "😡", label: "Tức giận" },
];

export default function PostCard({
    id,
    title,
    content,
    author,
    created_at,
    image_urls,
}: PostCardProps) {
    const { data: session } = useSession();
    const user_id = session?.user?.id; // hoặc session?.user?.sub nếu dùng JWT mặc định
    const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
    const [showReactions, setShowReactions] = useState(false);
    const [reactionStats, setReactionStats] = useState<Record<string, number>>({});
    const [totalReactions, setTotalReactions] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // 🧠 Fetch dữ liệu cảm xúc khi load bài viết
    useEffect(() => {
        const fetchReactions = async () => {
            try {
                // 1️⃣ Lấy thống kê cảm xúc
                const res = await fetch(`http://localhost:5000/api/reactions/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReactionStats(data.reactions || {});
                    setTotalReactions(data.total || 0);
                }

                // 2️⃣ Lấy cảm xúc của user hiện tại
                const userRes = await fetch(`http://localhost:5000/api/reactions/user/${user_id}/${id}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setSelectedReaction(userData.emoji);
                }
            } catch (err) {
                console.error("Lỗi khi lấy reactions:", err);
            }
        };
        fetchReactions();
    }, [id, user_id]);


    // 🧡 Gửi cảm xúc
    const handleReaction = async (emoji: string) => {
        if (isSending) return;
        setIsSending(true);

        try {
            setSelectedReaction(emoji);
            setShowReactions(false);

            const res = await fetch("http://localhost:5000/api/reactions/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    post_id: id,
                    user_id,
                    emoji,
                }),
            });

            if (res.ok) {
                // cập nhật lại dữ liệu sau khi gửi
                const updated = await fetch(`http://localhost:5000/api/reactions/${id}`);
                const data = await updated.json();
                setReactionStats(data.reactions || {});
                setTotalReactions(data.total || 0);
            }
        } catch (error) {
            console.error("Lỗi khi gửi reaction:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300">
            {/* Header */}
            <div className="flex items-center mb-3">
                <Image
                    src="/avatar.png"
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full border"
                />
                <div className="ml-3">
                    <p className="font-semibold text-gray-800">{author || "Người dùng ẩn danh"}</p>
                    <p className="text-xs text-gray-500">
                        {created_at ? new Date(created_at).toLocaleString() : "Vừa xong"}
                    </p>
                </div>
            </div>

            {/* Nội dung bài viết */}
            <div className="mb-3 text-gray-800">
                {title && <h3 className="font-semibold text-lg mb-1">{title}</h3>}
                <p className="whitespace-pre-line">{content}</p>
            </div>

            {/* Ảnh (nếu có) */}
            {image_urls && image_urls.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 rounded-lg overflow-hidden">
                    {image_urls.map((url, i) => (
                        // 💡 BƯỚC 3: THÊM onClick VÀ CSS CHO BIẾT CÓ THỂ CLICK
                        <div
                            key={i}
                            className="relative w-full h-64 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImage(url)} // Khi click, set ảnh được chọn
                        >
                            <Image
                                src={url}
                                alt={`Post image ${i + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 text-gray-500 text-sm relative">
                {/* Nút cảm xúc */}
                <div
                    className="relative"
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                >
                    <button
                        className={`transition flex items-center gap-1 ${selectedReaction ? "text-blue-600 font-medium" : "hover:text-blue-600"}`}
                    >
                        {selectedReaction ? (
                            <>
                                <span className="text-xl">{selectedReaction}</span>
                                <span>{reactionsList.find(r => r.emoji === selectedReaction)?.label || "Cảm xúc"}</span>
                            </>
                        ) : (
                            <>👍 Thích</>
                        )}
                    </button>

                    {/* Hiệu ứng emoji nổi */}
                    <AnimatePresence>
                        {showReactions && (
                            <motion.div
                                className="absolute -top-14 left-0 flex gap-2 bg-white border border-gray-200 shadow-lg rounded-full px-3 py-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                {reactionsList.map((r) => (
                                    <motion.button
                                        key={r.emoji}
                                        whileHover={{ scale: 1.4, y: -4 }}
                                        onClick={() => handleReaction(r.emoji)}
                                        className="text-2xl hover:cursor-pointer"
                                    >
                                        {r.emoji}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* AnimatePresence giúp hiệu ứng exit hoạt động */}
                <AnimatePresence>
                    {selectedImage && (
                        <ImageModal
                            imageUrl={selectedImage}
                            onClose={() => setSelectedImage(null)} // Khi đóng, set lại state về null
                        />
                    )}
                </AnimatePresence>

                {/* Nút bị khóa */}
                <div className="flex items-center gap-4 text-gray-400">
                    <button disabled className="cursor-not-allowed">
                        🚫 Bình luận
                    </button>
                    <button disabled className="cursor-not-allowed">
                        🚫 Chia sẻ
                    </button>
                </div>
            </div>

            {/* Hiển thị tổng kết cảm xúc */}
            {totalReactions > 0 && (
                <div className="mt-3 text-gray-600 text-sm flex items-center gap-2">
                    {Object.entries(reactionStats).map(([emoji, count]) => (
                        <span key={emoji}>
                            {emoji} {count}
                        </span>
                    ))}
                    <span className="ml-2 font-medium">
                        ({totalReactions} người đã bày tỏ cảm xúc)
                    </span>
                </div>
            )}
        </div>
    );
}
