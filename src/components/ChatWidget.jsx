import React, { useState } from 'react';
import './ChatWidget.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import DOMPurify from 'dompurify';

const SYSTEM_PROMPT = `
You are a compassionate and knowledgeable virtual health assistant specialized in providing simple, clear, and accurate health information to elderly users. Your role is to assist elderly people (typically aged 60 and above) in understanding and managing common health conditions such as high blood pressure, diabetes, arthritis, dementia, and heart disease.

Always communicate using plain, respectful, and encouraging language. Avoid medical jargon unless it's explained in simple terms. Respond slowly and patiently, as if you are talking to someone who may have hearing or memory difficulties.

Your goals:
- Explain symptoms, causes, and basic treatments of common chronic illnesses.
- Remind users about medication, hydration, and healthy daily routines (e.g., walking, diet).
- Politely recommend seeing a doctor when necessary, but never make diagnoses.
- Never give emergency medical advice. In emergencies, always instruct the user to call local emergency services or go to the nearest hospital.

Tone: Warm, respectful, supportive. Imagine you're a helpful, friendly nurse who genuinely cares.

Start each response by greeting the user by name (if known) and asking how you can assist today.
`;

const genAI = new GoogleGenerativeAI('AIzaSyDUFT2gVKCfgdcRKAJyRpfhm0aydKJmFKg'); // Replace with your API key

// Helper: Convert markdown-like to HTML (basic bold, line breaks)
function formatMessage(text) {
  // Replace **bold** with <b>bold</b>
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')      // Bold
    .replace(/\*(.*?)\*/g, '<i>$1</i>')          // Italic
    .replace(/`(.*?)`/g, '<code>$1</code>')      // Inline code
    .replace(/\n/g, '<br>');                     // Line breaks
  return html;
}

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Send system prompt as soon as chat opens
  const handleOpenChat = async () => {
    setIsOpen(true);
    setMessages([
      {
        text: "Hello! I am your virtual health assistant, always ready to support you. How can I help you today?",
        sender: 'gemini',
      },
    ]);
  };

  const toggleChat = () => {
    if (isOpen) {
      setMessages([]);
      setIsOpen(false);
    } else {
      handleOpenChat();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `${SYSTEM_PROMPT}\nUser: ${input}`;
      const result = await model.generateContent(prompt);
      const geminiText = result.response.text();
      setMessages((prev) => [...prev, { text: geminiText, sender: 'gemini' }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { text: 'Sorry, the consultation system is currently experiencing an issue.', sender: 'gemini' },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-widget">
      <button className="chat-toggle" onClick={toggleChat}>💬</button>
      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">Health Consultation</div>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              msg.sender === 'gemini' ? (
                <div
                  key={i}
                  className={`chat-msg ${msg.sender}`}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(formatMessage(msg.text)),
                  }}
                />
              ) : (
                <div key={i} className={`chat-msg ${msg.sender}`}>
                  {msg.text}
                </div>
              )
            ))}
            {loading && <div className="chat-msg gemini">Responding...</div>}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What would you like advice on?"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;