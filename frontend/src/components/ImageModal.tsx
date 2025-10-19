// components/ImageModal.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, MouseEvent } from 'react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  // Thêm sự kiện lắng nghe phím Escape để đóng Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Dọn dẹp event listener khi component bị unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        // Lớp nền mờ
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // Bấm ra ngoài để đóng
      >
        {/* Container cho ảnh để ngăn sự kiện click lan truyền */}
        <motion.div
          className="relative max-w-4xl max-h-[90vh] w-full"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          onClick={(e: MouseEvent) => e.stopPropagation()} // Ngăn việc bấm vào ảnh làm đóng modal
        >
          <Image
            src={imageUrl}
            alt="Enlarged post image"
            width={1200} // Cung cấp width/height lớn để Next.js tối ưu ảnh chất lượng cao
            height={800}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              objectFit: 'contain', // Đảm bảo toàn bộ ảnh được hiển thị
            }}
          />
        </motion.div>

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl hover:opacity-80 transition-opacity"
          aria-label="Close image view"
        >
          &times;
        </button>
      </motion.div>
    </AnimatePresence>
  );
}