import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { MOTI_SYSTEM_PROMPT } from "./constants/moti";
import { MarkdownText } from "./components/MarkdownText";
import { z } from "zod";

const API_KEY_STORAGE = "ELECTRON_GOOGLE_GENERATIVE_AI_API_KEY";

type Message = { 
  role: "user" | "ai"
  content: string
  reflection?: string
  showReflection?: boolean
};

function App() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useLocalStorage<string>(API_KEY_STORAGE, "");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [timerEnd, setTimerEnd] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const google = useMemo(() => {
    if (!apiKey) return null;
    return createGoogleGenerativeAI({ apiKey });
  }, [apiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!timerEnd) {
      setTimeRemaining("");
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = timerEnd - now;

      if (remaining <= 0) {
        setTimeRemaining("0:00");
        setTimerEnd(null);
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerEnd]);

  const startTimer = (timeMinutes: number) => {
    const ms = timeMinutes * 60000;
    setTimerEnd(Date.now() + ms);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    const updatedMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      if (!apiKey || !google) {
        setMessages((prev) => [...prev, { role: "ai", content: "hey, i need an api key to help you. click the emoji to set it up." }]);
        return;
      }

      // build conversation history for moti
      const conversationHistory = updatedMessages
        .map(msg => `${msg.role === "user" ? "user" : "moti"}: ${msg.content}`)
        .join('\n');

      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        system: MOTI_SYSTEM_PROMPT,
        prompt: conversationHistory,
        schema: z.object({
          reflection: z.string().describe("your internal analysis"),
          task: z.string().describe("the specific action for the user"),
          timeMinutes: z.number().describe("time limit in minutes"),
          hope: z.string().describe("why this task is right"),
        }),
      });

      const content = `${object.task}\n\n⏱️ ${object.timeMinutes >= 1 ? `${object.timeMinutes} minutes` : `${object.timeMinutes * 60} seconds`}`;
      const reflection = `**reflection:** ${object.reflection}\n\n**hope:** ${object.hope}`;
      
      setMessages((prev) => [...prev, { 
        role: "ai", 
        content,
        reflection,
        showReflection: false
      }]);
      startTimer(object.timeMinutes);
    } catch (error) {
      console.error("Error calling Gemini:", error);
      setApiKey("");
      setMessages((prev) => [...prev, { role: "ai", content: "api key seems invalid. click the emoji to set a new one." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showChat) {
    return (
      <div
        style={
          {
            width: "100vw",
            height: "100vh",
            display: "flex",
            WebkitAppRegion: "drag",
            position: "relative",
          } as any
        }
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!apiKey) {
              setTempKey("");
              setShowKeyModal(true);
            }
            setShowChat(true);
          }}
          style={
            {
              position: "absolute",
              top: "16px",
              right: "40px",
              fontSize: "64px",
              userSelect: "none",
              WebkitUserSelect: "none",
              cursor: "pointer",
              WebkitAppRegion: "no-drag",
              pointerEvents: "auto",
              zIndex: 999,
            } as any
          }
        >
          🥺
        </div>
        {/* small drag handle to the right of emoji */}
        <div
          style={
            {
              position: "absolute",
              top: "32px",
              right: "12px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.3)",
              WebkitAppRegion: "drag",
              cursor: "move",
              zIndex: 1000,
            } as any
          }
        />
        {showKeyModal && (
          <div
            style={{
              position: "fixed",
              inset: 0 as any,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              WebkitAppRegion: "no-drag",
              zIndex: 2000,
            } as any}
          >
            <div
              style={{
                width: 360,
                maxWidth: "90vw",
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontWeight: 600, fontSize: 16 }}>Enter API key</div>
              <input
                type="text"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Google Generative AI API key"
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  outline: "none",
                  fontSize: 14,
                }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowKeyModal(false)}
                  style={{
                    background: "#f2f2f7",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setApiKey(tempKey.trim());
                    setShowKeyModal(false);
                  }}
                  style={{
                    background: "#0a84ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        padding: "16px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* emoji in top-right */}
      <div
        onClick={() => {
          setTempKey(apiKey || "");
          setShowKeyModal(true);
        }}
        style={
          {
            position: "absolute",
            top: "16px",
            right: "40px",
            fontSize: "64px",
            userSelect: "none",
            WebkitAppRegion: "no-drag",
            zIndex: 999,
            cursor: "pointer",
          } as any
        }
      >
        🥺
      </div>

      {/* small drag handle to the right of emoji */}
      <div
        style={
          {
            position: "absolute",
            top: "32px",
            right: "12px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.3)",
            WebkitAppRegion: "drag",
            cursor: "move",
            zIndex: 1000,
          } as any
        }
      />

      {/* chat container */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "12px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        {/* close button and timer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setShowChat(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
              padding: "0",
              color: "#666",
            }}
          >
            ✕
          </button>
          {timeRemaining && (
            <div
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#333",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {timeRemaining}
            </div>
          )}
          <div style={{ width: "16px" }} />
        </div>

        {/* messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            marginBottom: "12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#999",
                  fontSize: "14px",
                  marginTop: "40px",
                }}
              >
                hey, i'm moti. tell me what you want to achieve and i'll help you get there, one small step at a time.
              </div>
            ) : (
              messages.map((msg, i) => {
                const isUser = msg.role === "user";
                const isAI = msg.role === "ai";
                return (
                  <div
                    key={i}
                    style={{
                      maxWidth: "85%",
                      alignSelf: isUser ? "flex-end" : "flex-start",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {isAI && msg.reflection && (
                      <button
                        onClick={() => {
                          setMessages(prev => prev.map((m, idx) => 
                            idx === i ? { ...m, showReflection: !m.showReflection } : m
                          ))
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#999",
                          fontSize: "12px",
                          cursor: "pointer",
                          padding: "4px 8px",
                          textAlign: "left",
                          alignSelf: "flex-start",
                        }}
                      >
                        {msg.showReflection ? "hide thinking" : "show thinking"}
                      </button>
                    )}
                    {isAI && msg.showReflection && msg.reflection && (
                      <div
                        style={{
                          background: "#f5f5f7",
                          color: "#666",
                          padding: "8px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontStyle: "italic",
                          marginBottom: "4px",
                        }}
                      >
                        <MarkdownText content={msg.reflection} />
                      </div>
                    )}
                    <div
                      style={{
                        background: "white",
                        color: "#333",
                        padding: "12px 16px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        wordWrap: "break-word",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        position: "relative",
                      }}
                    >
                      {isUser && (
                        <div
                          style={{
                            position: "absolute",
                            right: "-8px",
                            bottom: "12px",
                            width: "0",
                            height: "0",
                            borderLeft: "8px solid white",
                            borderTop: "8px solid transparent",
                            borderBottom: "8px solid transparent",
                          }}
                        />
                      )}
                      {isAI && (
                        <div
                          style={{
                            position: "absolute",
                            left: "-8px",
                            bottom: "12px",
                            width: "0",
                            height: "0",
                            borderRight: "8px solid white",
                            borderTop: "8px solid transparent",
                            borderBottom: "8px solid transparent",
                          }}
                        />
                      )}
                      <MarkdownText content={msg.content} />
                    </div>
                  </div>
                );
              })
            )}
            {isLoading && (
              <div
                style={{
                  background: "#0a84ff",
                  color: "white",
                  padding: "12px 16px",
                  borderRadius: "20px",
                  maxWidth: "85%",
                  alignSelf: "flex-start",
                  fontSize: "14px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-8px",
                    bottom: "12px",
                    width: "0",
                    height: "0",
                    borderRight: "8px solid #0a84ff",
                    borderTop: "8px solid transparent",
                    borderBottom: "8px solid transparent",
                  }}
                />
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <div style={{ 
                    width: "6px", 
                    height: "6px", 
                    borderRadius: "50%", 
                    background: "white",
                    animation: "pulse 1.4s ease-in-out infinite",
                    animationDelay: "0s"
                  }} />
                  <div style={{ 
                    width: "6px", 
                    height: "6px", 
                    borderRadius: "50%", 
                    background: "white",
                    animation: "pulse 1.4s ease-in-out infinite",
                    animationDelay: "0.2s"
                  }} />
                  <div style={{ 
                    width: "6px", 
                    height: "6px", 
                    borderRadius: "50%", 
                    background: "white",
                    animation: "pulse 1.4s ease-in-out infinite",
                    animationDelay: "0.4s"
                  }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* quick reply buttons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <button
            onClick={async () => {
              if (isLoading) return
              setInput("yes")
              const userMessage = "yes"
              const updatedMessages: Message[] = [...messages, { role: "user", content: userMessage }]
              setMessages(updatedMessages)
              setIsLoading(true)

              try {
                if (!apiKey || !google) {
                  setMessages((prev) => [...prev, { role: "ai", content: "hey, i need an api key to help you. click the emoji to set it up." }])
                  return
                }

                const conversationHistory = updatedMessages
                  .map(msg => `${msg.role === "user" ? "user" : "moti"}: ${msg.content}`)
                  .join('\n')

                const { object } = await generateObject({
                  model: google("gemini-2.5-flash"),
                  system: MOTI_SYSTEM_PROMPT,
                  prompt: conversationHistory,
                  schema: z.object({
                    reflection: z.string().describe("your internal analysis"),
                    task: z.string().describe("the specific action for the user"),
                    timeMinutes: z.number().describe("time limit in minutes"),
                    hope: z.string().describe("why this task is right"),
                  }),
                })

                setMessages((prev) => [...prev, { role: "ai", content: object.task, reflection: object.reflection, showReflection: false }])
                startTimer(object.timeMinutes)
              } catch (error) {
                console.error("Error calling Gemini:", error)
                setApiKey("")
                setMessages((prev) => [...prev, { role: "ai", content: "api key seems invalid. click the emoji to set a new one." }])
              } finally {
                setIsLoading(false)
                setInput("")
              }
            }}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              background: "white",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 500,
              color: "#333",
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            yes
          </button>
          <button
            onClick={async () => {
              if (isLoading) return
              setInput("no")
              const userMessage = "no"
              const updatedMessages: Message[] = [...messages, { role: "user", content: userMessage }]
              setMessages(updatedMessages)
              setIsLoading(true)

              try {
                if (!apiKey || !google) {
                  setMessages((prev) => [...prev, { role: "ai", content: "hey, i need an api key to help you. click the emoji to set it up." }])
                  return
                }

                const conversationHistory = updatedMessages
                  .map(msg => `${msg.role === "user" ? "user" : "moti"}: ${msg.content}`)
                  .join('\n')

                const { object } = await generateObject({
                  model: google("gemini-2.5-flash"),
                  system: MOTI_SYSTEM_PROMPT,
                  prompt: conversationHistory,
                  schema: z.object({
                    reflection: z.string().describe("your internal analysis"),
                    task: z.string().describe("the specific action for the user"),
                    timeMinutes: z.number().describe("time limit in minutes"),
                    hope: z.string().describe("why this task is right"),
                  }),
                })

                const content = `${object.task}\n\n⏱️ ${object.timeMinutes >= 1 ? `${object.timeMinutes} minutes` : `${object.timeMinutes * 60} seconds`}`
                const reflection = `**reflection:** ${object.reflection}\n\n**hope:** ${object.hope}`
                
                setMessages((prev) => [...prev, { 
                  role: "ai", 
                  content,
                  reflection,
                  showReflection: false
                }])
                startTimer(object.timeMinutes)
              } catch (error) {
                console.error("Error calling Gemini:", error)
                setApiKey("")
                setMessages((prev) => [...prev, { role: "ai", content: "api key seems invalid. click the emoji to set a new one." }])
              } finally {
                setIsLoading(false)
                setInput("")
              }
            }}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              background: "white",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 500,
              color: "#333",
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            no
          </button>
        </div>

        {/* input */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="did you complete it? or tell me what happened..."
            style={{
              flex: 1,
              padding: "14px 20px",
              borderRadius: "25px",
              border: "none",
              outline: "none",
              fontSize: "15px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              background: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              color: "#333",
              resize: "none",
              minHeight: "50px",
              maxHeight: "150px",
              overflowY: "auto",
            }}
          />
          <button
            onClick={handleSend}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "#d1d1d6",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ transform: "translateX(1px)" }}
            >
              <path
                d="M5 10L15 10M15 10L11 6M15 10L11 14"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      {showKeyModal && (
        <div
          style={{
            position: "fixed",
            inset: 0 as any,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            WebkitAppRegion: "no-drag",
            zIndex: 2000,
          } as any}
        >
          <div
            style={{
              width: 360,
              maxWidth: "90vw",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 600, fontSize: 16 }}>Enter API key</div>
            <input
              type="text"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Google Generative AI API key"
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                outline: "none",
                fontSize: 14,
              }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowKeyModal(false)}
                style={{
                  background: "#f2f2f7",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setApiKey(tempKey.trim());
                  setShowKeyModal(false);
                }}
                style={{
                  background: "#0a84ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
