'use client';

export default function LoginRequiredModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm text-center animate-fadeIn">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">
                    🔒 Bạn cần đăng nhập
                </h2>
                <p className="text-gray-600 mb-6">
                    Hãy đăng nhập để có thể đăng bài và tương tác cùng mọi người nhé!
                </p>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => (window.location.href = '/login')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Đăng nhập
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
