"use client";

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import './ChatbotModal.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotModalProps {
  onClose: () => void;
}

export default function ChatbotModal({ onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Bonjour ! 👋 Je suis votre assistant habitat intermédiaire. Comment puis-je vous aider aujourd'hui ?\n\n💡 **Quelques idées** :\n- \"Qu'est-ce que l'habitat inclusif ?\"\n- \"Des résidences autonomie pas chères dans le Finistère ?\"\n- \"C'est quoi l'AVP ?\"\n- \"Je touche 800€ de retraite, c'est possible ?\""
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const lastSentRef = useRef<number>(0);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input au chargement
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Charger l'historique depuis sessionStorage
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('chatbot_history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (e) {
        console.error('Erreur chargement historique:', e);
      }
    }
  }, []);

  // Sauvegarder l'historique
  useEffect(() => {
    if (messages.length > 1) { // Skip initial message
      sessionStorage.setItem('chatbot_history', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Throttle rapide pour éviter le spam (800ms)
    const now = Date.now();
    if (now - (lastSentRef.current || 0) < 800) return;
    lastSentRef.current = now;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Annuler toute requête en cours avant d'en envoyer une nouvelle
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      controllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
        signal: controllerRef.current.signal,
      });

      if (!response.ok) {
        // Message plus précis pour 429
        if (response.status === 429) {
          const data = await response.json().catch(() => ({}));
          const msg = data?.message || "Le service est momentanément saturé. Réessayez dans quelques secondes.";
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: `⚠️ ${msg}` },
          ]);
          return;
        }
        throw new Error('Erreur API');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'Désolé, je n\'ai pas pu traiter votre demande.',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Ignorer les erreurs d'annulation
      if ((error as any)?.name === 'AbortError') {
        return;
      }
      console.error('Erreur chatbot:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Une erreur est survenue. Veuillez réessayer.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Conversation réinitialisée ! 🔄 Comment puis-je vous aider ?"
      }
    ]);
    sessionStorage.removeItem('chatbot_history');
  };

  // Abandonner la requête en cours si on ferme le modal
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="chatbot-backdrop" onClick={onClose}>
      <div className="chatbot-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <div className="chatbot-header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#d9876a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="10" r="1" fill="#d9876a"/>
                <circle cx="15" cy="10" r="1" fill="#d9876a"/>
                <path d="M9 14c0.5 0.5 1.5 1 3 1s2.5-0.5 3-1" stroke="#d9876a" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="chatbot-title">Assistant Habitat Intermédiaire</h2>
              <p className="chatbot-subtitle">Posez-moi toutes vos questions !</p>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button
              onClick={clearHistory}
              className="chatbot-clear-btn"
              title="Nouvelle conversation"
              aria-label="Effacer l'historique"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={onClose}
              className="chatbot-close-btn"
              aria-label="Fermer le chatbot"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chatbot-message ${msg.role === 'user' ? 'chatbot-message-user' : 'chatbot-message-assistant'}`}
            >
              {msg.role === 'assistant' && (
                <div className="chatbot-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#d9876a" strokeWidth="2"/>
                    <circle cx="9" cy="10" r="1.5" fill="#d9876a"/>
                    <circle cx="15" cy="10" r="1.5" fill="#d9876a"/>
                    <path d="M8 15c1 1.5 3 2 4 2s3-0.5 4-2" stroke="#d9876a" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
              <div className="chatbot-message-content">
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => {
                      const href = props.href || '';
                      // Liens internes Next.js
                      if (href.startsWith('/')) {
                        return (
                          <Link href={href} className="chatbot-link" onClick={onClose}>
                            {props.children}
                          </Link>
                        );
                      }
                      // Liens externes
                      return (
                        <a
                          {...props}
                          className="chatbot-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
              {msg.role === 'user' && (
                <div className="chatbot-avatar chatbot-avatar-user">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="#666" strokeWidth="2"/>
                    <path d="M5 20c0-4 3-7 7-7s7 3 7 7" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="chatbot-message chatbot-message-assistant">
              <div className="chatbot-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#d9876a" strokeWidth="2"/>
                  <circle cx="9" cy="10" r="1.5" fill="#d9876a"/>
                  <circle cx="15" cy="10" r="1.5" fill="#d9876a"/>
                  <path d="M8 15c1 1.5 3 2 4 2s3-0.5 4-2" stroke="#d9876a" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="chatbot-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chatbot-input-container">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre question..."
            className="chatbot-input"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="chatbot-send-btn"
            aria-label="Envoyer le message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
