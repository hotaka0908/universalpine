// Next.jsu30d5u30edu30f3u30c8u30a8u30f3u30c9u30b3u30f3u30ddu30fcu30cdu30f3u30c8

"use client"

import { useState, useRef, useEffect } from "react";
import styles from "./VoiceChat.module.css";

export default function VoiceChat() {
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("u304au8a71u3057u307eu305bu3093u304buff1f");
  const [messages, setMessages] = useState<{role:"user"|"assistant",text:string}[]>([]);
  const audioChunks = useRef<Blob[]>([]);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // u30deu30a4u30afu30dcu30bfu30f3u3092u30afu30eau30c3u30af/u30bfu30c3u30c1u3057u3066u3044u308bu9593u306fu9332u97f3
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };
      
      mediaRecorder.start();
      setRec(mediaRecorder);
      setIsListening(true);
      setStatusText("u304au8a71u3057u304fu3060u3055u3044...");
    } catch (error) {
      console.error("u30deu30a4u30afu30a2u30afu30bbu30b9u30a8u30e9u30fc:", error);
      setStatusText("u30deu30a4u30afu306eu4f7fu7528u304cu8a31u53efu3055u308cu3066u3044u307eu305bu3093");
    }
  };

  const stopRecording = async () => {
    if (!rec || rec.state === "inactive") return;
    
    rec.stop();
    setIsListening(false);
    setIsProcessing(true);
    setStatusText("u304au7b54u3048u3092u8003u3048u3066u3044u307eu3059...");
    
    rec.onstop = async () => {
      try {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        audioChunks.current = [];
        
        // u30e6u30fcu30b6u30fcu30e1u30c3u30bbu30fcu30b8u3092u8ffdu52a0
        setMessages(prev => [...prev, { role: "user", text: "u97f3u58f0u3092u51e6u7406u4e2d..." }]);
        
        const fd = new FormData();
        fd.append("file", blob, "voice.webm");
        
        // APIu30eau30afu30a8u30b9u30c8u9001u4fe1
        const res = await fetch("/api/voice", { method: "POST", body: fd });
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        
        // u97f3u58f0u5fdcu7b54u3092u53d6u5f97
        const assistantAudio = await res.blob();
        
        // u97f3u58f0u3092u518du751f
        const url = URL.createObjectURL(assistantAudio);
        const audio = new Audio(url);
        
        // u97f3u58f0u518du751fu524du306bu30e1u30c3u30bbu30fcu30b8u3092u8ffdu52a0
        setMessages(prev => {
          // u6700u5f8cu306eu30e6u30fcu30b6u30fcu30e1u30c3u30bbu30fcu30b8u3092u66f4u65b0
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === "user") {
            updated[updated.length - 1].text = "u97f3u58f0u8a8du8b58u5b8cu4e86";
          }
          return [...updated, { role: "assistant", text: "(u97f3u58f0u518du751fu4e2d...)" }];
        });
        
        // u97f3u58f0u518du751f
        audio.play();
        
        // u518du751fu7d42u4e86u6642u306eu51e6u7406
        audio.onended = () => {
          setIsProcessing(false);
          setStatusText("u304au8a71u3057u307eu305bu3093u304buff1f");
        };
        
      } catch (error) {
        console.error("u97f3u58f0u51e6u7406u30a8u30e9u30fc:", error);
        setIsProcessing(false);
        setStatusText("u30a8u30e9u30fcu304cu767au751fu3057u307eu3057u305fu3002u3082u3046u4e00u5ea6u304au8a66u3057u304fu3060u3055u3044");
      }
    };
  };

  // u30c6u30adu30b9u30c8u5165u529bu30e2u30fcu30c9u306eu5207u308au66ffu3048
  const [isTextMode, setIsTextMode] = useState(false);
  const [textInput, setTextInput] = useState("");
  
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    // u30e6u30fcu30b6u30fcu30e1u30c3u30bbu30fcu30b8u3092u8ffdu52a0
    setMessages(prev => [...prev, { role: "user", text: textInput }]);
    setTextInput("");
    setIsProcessing(true);
    setStatusText("u304au7b54u3048u3092u8003u3048u3066u3044u307eu3059...");
    
    try {
      // APIu30eau30afu30a8u30b9u30c8u9001u4fe1
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput })
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      const assistantText = data.text;
      
      // u30a2u30b7u30b9u30bfu30f3u30c8u30e1u30c3u30bbu30fcu30b8u3092u8ffdu52a0
      setMessages(prev => [...prev, { role: "assistant", text: assistantText }]);
      
      // u97f3u58f0u518du751f
      const speechRes = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: assistantText })
      });
      
      if (speechRes.ok) {
        const audioBlob = await speechRes.blob();
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.play();
        
        // u518du751fu7d42u4e86u6642u306eu51e6u7406
        audio.onended = () => {
          setIsProcessing(false);
          setStatusText("u304au8a71u3057u307eu305bu3093u304buff1f");
        };
      }
      
    } catch (error) {
      console.error("u30c6u30adu30b9u30c8u51e6u7406u30a8u30e9u30fc:", error);
      setIsProcessing(false);
      setStatusText("u30a8u30e9u30fcu304cu767au751fu3057u307eu3057u305fu3002u3082u3046u4e00u5ea6u304au8a66u3057u304fu3060u3055u3044");
    }
  };
  
  // u30c1u30e3u30c3u30c8u5c65u6b74u3092u30afu30eau30a2
  const clearHistory = () => {
    setMessages([]);
  };
  
  // u30e1u30c3u30bbu30fcu30b8u304cu8ffdu52a0u3055u308cu305fu3089u30b9u30afu30edu30fcu30ebu3092u4e0bu306bu79fbu52d5
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.voiceChatContainer}>
      <div className={styles.voiceChatHeader}>
        <div className={styles.voiceChatTitle}>AIu30a2u30b7u30b9u30bfu30f3u30c8</div>
      </div>
      
      <div className={styles.chatHistory} ref={chatHistoryRef}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={msg.role === "user" ? styles.userMessage : styles.aiMessage}
          >
            <div className={styles.messageContent}>{msg.text}</div>
          </div>
        ))}
      </div>
      
      <div className={styles.controls}>
        {!isTextMode ? (
          <>
            <button 
              className={`${styles.micButton} ${isListening ? styles.listening : ''} ${isProcessing ? styles.processing : ''}`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isProcessing}
              title="u97f3u58f0u5165u529bu3092u958bu59cb"
              aria-label="u97f3u58f0u5165u529bu3092u958bu59cb"
            >
              <svg className={styles.micIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
            <div className={`${styles.statusText} ${isListening ? styles.listening : ''} ${isProcessing ? styles.processing : ''}`}>
              {statusText}
            </div>
            <div className={styles.settingsPanel}>
              <button 
                className={styles.settingsButton} 
                onClick={clearHistory}
                title="u4f1au8a71u5c65u6b74u3092u30afu30eau30a2"
                aria-label="u4f1au8a71u5c65u6b74u3092u30afu30eau30a2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                  <path d="M19 6H5L6 20H18L19 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10 10V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M14 10V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 6L9 4H15L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                u5c65u6b74u30afu30eau30a2
              </button>
              <button 
                className={styles.settingsButton} 
                onClick={() => setIsTextMode(true)}
                title="u30c6u30adu30b9u30c8u3067u5165u529b"
                aria-label="u30c6u30adu30b9u30c8u3067u5165u529b"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                  <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                u30c6u30adu30b9u30c8u5165u529b
              </button>
            </div>
          </>
        ) : (
          <form className={styles.textInputForm} onSubmit={handleTextSubmit}>
            <input
              type="text"
              className={styles.textInput}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="u30e1u30c3u30bbu30fcu30b8u3092u5165u529b..."
              disabled={isProcessing}
            />
            <button 
              type="submit" 
              className={styles.sendButton}
              disabled={isProcessing}
            >
              u9001u4fe1
            </button>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => setIsTextMode(false)}
              disabled={isProcessing}
            >
              u97f3u58f0u30e2u30fcu30c9u306bu623bu308b
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
