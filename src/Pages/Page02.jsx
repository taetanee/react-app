import React, { useState, useRef, useEffect } from "react";

export default function Page02() {
    const [input, setInput] = useState("");
    // 브라우저에 저장된 비밀번호가 있으면 불러옴
    const [password, setPassword] = useState(localStorage.getItem("chat_pwd") || "");
    const [messages, setMessages] = useState([
        { role: "assistant", content: "안녕하세요. 인증 후 이용 가능합니다. 😊" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        
        if (!password) {
            alert("비밀번호를 입력해주세요.");
            return;
        }

        const userMsg = input;
        setInput(""); 
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch("http://124.53.139.229:28000/chat", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "X-Access-Password": password 
                },
                body: JSON.stringify({ message: userMsg }),
            });

            if (response.status === 401) {
                throw new Error("인증 실패: 비밀번호가 틀렸습니다.");
            }

            if (!response.ok) throw new Error("서버 응답 오류");

            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
            
            localStorage.setItem("chat_pwd", password);

        } catch (error) {
            console.error("채팅 오류:", error);
            setMessages(prev => [...prev, { role: "assistant", content: `${error.message} 😭` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const chatContainerStyle = {
        maxWidth: "800px",
        margin: "10px auto",
        height: "70vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        overflow: "hidden",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    };

    const bubbleStyle = (role) => ({
        maxWidth: "75%",
        padding: "12px 16px",
        borderRadius: "15px",
        marginBottom: "10px",
        fontSize: "15px",
        lineHeight: "1.5",
        alignSelf: role === "user" ? "flex-end" : "flex-start",
        backgroundColor: role === "user" ? "#3498db" : "#f1f0f0",
        color: role === "user" ? "#fff" : "#333",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    });

    return (
        <div style={{ padding: "20px", backgroundColor: "#f4f7f6", minHeight: "90vh" }}>
            
            {/* 비밀번호 입력 영역 (수정됨) */}
            <div style={{ maxWidth: "800px", margin: "0 auto 10px auto", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "13px", color: "#e67e22", fontWeight: "bold" }}>💡 힌트: 휴대폰번호(- 없이)</span>
                <input 
                    type="text"  // (1) password에서 text로 변경하여 값이 보이게 함
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 입력"
                    style={{
                        padding: "5px 10px",
                        borderRadius: "5px",
                        border: "1px solid #ddd",
                        fontSize: "13px",
                        outline: "none",
                        width: "150px"
                    }}
                />
            </div>

            <div style={chatContainerStyle}>
                <div ref={scrollRef} style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={bubbleStyle(msg.role)}>
                            {msg.content}
                        </div>
                    ))}
                    {isLoading && (
                        <div style={{ ...bubbleStyle("assistant"), fontStyle: "italic", color: "#888" }}>
                            비서가 답변을 작성하고 있습니다...
                        </div>
                    )}
                </div>

                <form onSubmit={handleSendMessage} style={{ display: "flex", padding: "15px", borderTop: "1px solid #eee", backgroundColor: "#fff" }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={password ? "메시지를 입력하세요..." : "상단에 비밀번호를 입력하세요."}
                        disabled={!password}
                        style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "25px",
                            border: "1px solid #ddd",
                            marginRight: "10px",
                            outline: "none",
                            fontSize: "14px"
                        }}
                    />
                    <button type="submit" disabled={isLoading || !password} style={{
                        padding: "10px 20px",
                        backgroundColor: (isLoading || !password) ? "#bdc3c7" : "#2c3e50",
                        color: "#fff",
                        border: "none",
                        borderRadius: "25px",
                        cursor: (isLoading || !password) ? "default" : "pointer",
                        fontWeight: "bold"
                    }}>
                        전송
                    </button>
                </form>
            </div>
        </div>
    );
}