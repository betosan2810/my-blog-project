import Image from "next/image";

interface PostCardProps {
    id: number;
    title: string;
    content: string;
    author?: string;
    created_at?: string;
    image_urls?: string[];
}

export default function PostCard({
    title,
    content,
    author,
    created_at,
    image_urls,
}: PostCardProps) {
    return (
        <div className="bg-white shadow-md rounded-2xl p-4 border border-gray-200">
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
                        <div key={i} className="relative w-full h-64">
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
            <div className="flex justify-between items-center mt-4 text-gray-500 text-sm">
                <div className="flex items-center gap-4">
                    <button className="hover:text-blue-600 transition">👍 Thích</button>
                    <button className="hover:text-blue-600 transition">💬 Bình luận</button>
                    <button className="hover:text-blue-600 transition">↗️ Chia sẻ</button>
                </div>
            </div>
        </div>
    );
}
