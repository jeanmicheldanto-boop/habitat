"use client";

import { useState, useEffect } from 'react';
import ChatbotModal from './ChatbotModal';

export default function ChatbotIcon() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openChatbot', handleOpen);
    return () => window.removeEventListener('openChatbot', handleOpen);
  }, []);

  return (
    <>
      {isOpen && <ChatbotModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
