import React, { useState, useEffect, useRef, useCallback } from "react";

const YOUTUBE_VIDEO_ID = "ZqJ7bfgacSA"; // IU - Love Wins All MV

const HEARTS = ["💗", "💖", "💝", "💓", "💕", "❤️", "🌸", "✨"];

function FloatingHeart({ id, onRemove }) {
    const style = {
        position: "fixed",
        left: `${Math.random() * 90 + 5}%`,
        bottom: "-40px",
        fontSize: `${Math.random() * 18 + 18}px`,
        animation: `floatUp ${Math.random() * 3 + 4}s ease-in forwards`,
        pointerEvents: "none",
        zIndex: 9999,
        userSelect: "none",
    };
    const symbol = HEARTS[Math.floor(Math.random() * HEARTS.length)];

    useEffect(() => {
        const t = setTimeout(() => onRemove(id), 7000);
        return () => clearTimeout(t);
    }, [id, onRemove]);

    return <span style={style}>{symbol}</span>;
}

export default function ProposalPage() {
    const [step, setStep] = useState(0); // 0: 인트로, 1: 메시지, 2: 질문, 3: 수락
    const [hearts, setHearts] = useState([]);
    const [noCount, setNoCount] = useState(0);
    const [noStyle, setNoStyle] = useState({});
    const heartIdRef = useRef(0);

    const [musicStarted, setMusicStarted] = useState(false);
    const playerRef = useRef(null);
    const playerReadyRef = useRef(false);

    // YouTube IFrame API 로드 & 플레이어 초기화 (autoplay 없이 대기)
    useEffect(() => {
        const initPlayer = () => {
            if (playerRef.current) return;
            playerRef.current = new window.YT.Player("yt-hidden-player", {
                videoId: YOUTUBE_VIDEO_ID,
                playerVars: {
                    autoplay: 0,
                    loop: 1,
                    playlist: YOUTUBE_VIDEO_ID,
                    controls: 0,
                    modestbranding: 1,
                    playsinline: 1, // iOS 필수
                },
                events: {
                    onReady: () => { playerReadyRef.current = true; },
                },
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch (_) {}
                playerRef.current = null;
                playerReadyRef.current = false;
            }
        };
    }, []);

    const addHearts = (n = 6) => {
        const newHearts = Array.from({ length: n }, () => ({
            id: ++heartIdRef.current,
        }));
        setHearts((prev) => [...prev, ...newHearts]);
    };

    const removeHeart = (id) => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
    };

    // step 0 다음: 사용자 제스처 안에서 playVideo() → iOS 사파리 호환
    const handleStart = useCallback(() => {
        if (playerRef.current && playerReadyRef.current) {
            playerRef.current.playVideo();
        }
        setMusicStarted(true);
        setStep(1);
    }, []);

    // step 1 다음: 그냥 step 2로
    const handleStep1Next = useCallback(() => {
        setStep(2);
    }, []);

    // 하트 반복 생성
    useEffect(() => {
        if (step >= 1) {
            addHearts(4);
            const interval = setInterval(() => addHearts(2), 2500);
            return () => clearInterval(interval);
        }
    }, [step]);

    const handleNo = () => {
        alert("오류가 발생했습니다");
    };

    const handleYes = () => {
        addHearts(20);
        setStep(8);
        setTimeout(() => addHearts(20), 600);
        setTimeout(() => addHearts(20), 1200);
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;700&display=swap');

                @keyframes floatUp {
                    0%   { transform: translateY(0) scale(1);   opacity: 0.9; }
                    80%  { opacity: 0.7; }
                    100% { transform: translateY(-110vh) scale(0.4); opacity: 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50%      { transform: scale(1.08); }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                @keyframes heartBeat {
                    0%,100% { transform: scale(1); }
                    14%     { transform: scale(1.3); }
                    28%     { transform: scale(1); }
                    42%     { transform: scale(1.3); }
                    70%     { transform: scale(1); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }

                .proposal-root {
                    font-family: 'Noto Sans KR', sans-serif;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #fff0f3 0%, #fce4ec 40%, #f3e5f5 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    position: relative;
                }

                .card {
                    background: rgba(255,255,255,0.85);
                    backdrop-filter: blur(12px);
                    border-radius: 28px;
                    padding: 48px 52px;
                    max-width: 480px;
                    width: 90%;
                    box-shadow: 0 20px 60px rgba(233,30,99,0.15);
                    text-align: center;
                    animation: fadeIn 0.8s ease both;
                    position: relative;
                    z-index: 10;
                }

                .big-heart {
                    font-size: 72px;
                    animation: heartBeat 1.4s ease infinite;
                    display: block;
                    margin-bottom: 12px;
                }

                .title {
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0 0 10px;
                    background: linear-gradient(90deg, #e91e63, #9c27b0, #e91e63);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 3s linear infinite, pulse 2.4s ease infinite;
                }

                .subtitle {
                    font-size: 15px;
                    color: #888;
                    margin-bottom: 32px;
                    line-height: 1.7;
                }

                .message-text {
                    font-size: 17px;
                    color: #444;
                    line-height: 1.85;
                    margin-bottom: 36px;
                    word-break: keep-all;
                }

                .btn-yes {
                    background: linear-gradient(135deg, #e91e63, #f06292);
                    color: white;
                    border: none;
                    border-radius: 50px;
                    padding: 16px 48px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(233,30,99,0.35);
                    transition: transform 0.15s, box-shadow 0.15s;
                    animation: pulse 2s ease infinite;
                    font-family: 'Noto Sans KR', sans-serif;
                }
                .btn-yes:hover {
                    transform: scale(1.06);
                    box-shadow: 0 10px 28px rgba(233,30,99,0.45);
                }

                .btn-no {
                    background: transparent;
                    color: #bbb;
                    border: 1.5px solid #ddd;
                    border-radius: 50px;
                    padding: 12px 32px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: transform 0.12s, color 0.2s;
                    font-family: 'Noto Sans KR', sans-serif;
                    white-space: nowrap;
                }
                .btn-no:hover { color: #e91e63; }

                .btn-row {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }

                .accept-emoji {
                    font-size: 80px;
                    margin-bottom: 8px;
                    animation: heartBeat 1s ease infinite;
                    display: block;
                }

                .intro-text {
                    font-size: 20px;
                    color: #e91e63;
                    font-weight: 700;
                    animation: pulse 1.6s ease infinite;
                }

                .ring {
                    font-size: 52px;
                    animation: spin 8s linear infinite;
                    display: inline-block;
                    margin-bottom: 4px;
                }

                .btn-start {
                    background: linear-gradient(135deg, #e91e63, #ce93d8);
                    color: white;
                    border: none;
                    border-radius: 50px;
                    padding: 16px 44px;
                    font-size: 17px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 6px 24px rgba(233,30,99,0.3);
                    transition: transform 0.15s, box-shadow 0.15s;
                    animation: pulse 2s ease infinite;
                    font-family: 'Noto Sans KR', sans-serif;
                    margin-top: 24px;
                    letter-spacing: 0.3px;
                }
                .btn-start:hover {
                    transform: scale(1.06);
                    box-shadow: 0 10px 30px rgba(233,30,99,0.4);
                }

                .music-badge {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: rgba(255,255,255,0.9);
                    border-radius: 50px;
                    padding: 6px 14px;
                    font-size: 12px;
                    color: #e91e63;
                    font-weight: 600;
                    box-shadow: 0 2px 12px rgba(233,30,99,0.2);
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    animation: fadeIn 1s ease 0.5s both;
                }
                .music-note {
                    animation: pulse 1.2s ease infinite;
                    display: inline-block;
                }
            `}</style>

            {/* 떠다니는 하트들 */}
            {hearts.map((h) => (
                <FloatingHeart key={h.id} id={h.id} onRemove={removeHeart} />
            ))}

            <div className="proposal-root">
                {/* 숨겨진 유튜브 플레이어 (항상 DOM에 존재해야 API가 초기화됨) */}
                <div
                    id="yt-hidden-player"
                    style={{ position: "fixed", width: 0, height: 0, top: 0, left: 0, zIndex: -1, overflow: "hidden" }}
                />

                {/* 음악 재생 중 배지 */}
                {musicStarted && (
                    <div className="music-badge">
                        <span className="music-note">♪</span>
                        Love Wins All — IU
                    </div>
                )}

                {/* (0) 인트로 */}
                {step === 0 && (
                    <div className="card">
                        {/* <span className="big-heart">💝</span> */}
                        <p className="intro-text">날 데려가 줄래?</p>
                        <button className="btn-start" onClick={handleStart}>
                            다음
                        </button>
                    </div>
                )}

                {/* (1) */}
                {step === 1 && (
                    <div className="card">
                        {/* <span className="big-heart">✨</span> */}
                        <p className="message-text">
                            나의 이 가난한 상상력으론<br />
                            떠올릴 수 없는 곳으로
                        </p>
                        <button className="btn-yes" onClick={handleStep1Next}>
                            다음
                        </button>
                    </div>
                )}

                {/* (2) */}
                {step === 2 && (
                    <div className="card">
                        {/* <span className="big-heart">🚀</span> */}
                        <p className="message-text">
                            꼭 같이 가줄래?<br />
                            그곳이 어디든<br />
                            오랜 외로움, 그 반대말을 찾아서
                        </p>
                        <button className="btn-yes" onClick={() => setStep(3)}>
                            다음
                        </button>
                    </div>
                )}

                {/* (3) */}
                {step === 3 && (
                    <div className="card">
                        {/* <span className="big-heart">💫</span> */}
                        <p className="message-text">
                            나와 저 끝까지 가줘
                        </p>
                        <button className="btn-yes" onClick={() => setStep(4)}>
                            다음
                        </button>
                    </div>
                )}

                {/* (4) */}
                {step === 4 && (
                    <div className="card">
                        {/* <span className="big-heart">🤍</span> */}
                        <p className="message-text">
                            부서지도록 나를 꼭 안아
                        </p>
                        <button className="btn-yes" onClick={() => setStep(5)}>
                            다음
                        </button>
                    </div>
                )}

                {/* (5) */}
                {step === 5 && (
                    <div className="card">
                        {/* <span className="big-heart">🌅</span> */}
                        <p className="message-text">
                            나와 함께 겁 없이 저물어줄래?
                        </p>
                        <button className="btn-yes" onClick={() => setStep(6)}>
                            다음
                        </button>
                    </div>
                )}

                {/* (6) */}
                {step === 6 && (
                    <div className="card">
                        {/* <span className="big-heart">🥹</span> */}
                        <p className="message-text">
                            너와 슬퍼지고 싶어
                        </p>
                        <button className="btn-yes" onClick={() => setStep(7)}>
                            다음
                        </button>
                    </div>
                )}

                {/* (7) 질문 */}
                {step === 7 && (
                    <div className="card">
                        <span className="ring">💍</span>
                        <p className="message-text" style={{ marginTop: "12px" }}>
                            나랑 결혼해줄래?
                        </p>
                        <div className="btn-row">
                            <button className="btn-yes" onClick={handleYes}>
                                예
                            </button>
                            <button className="btn-no" onClick={handleNo}>
                                아니오
                            </button>
                        </div>
                    </div>
                )}

                {/* (8) 수락 */}
                {step === 8 && (
                    <div className="card">
                        {/* <span className="accept-emoji">🥰</span> */}
                        <h1 className="title">❤️</h1>
                        <p className="message-text">
                            사랑해
                        </p>
                        <p style={{ fontSize: "32px", marginTop: "4px" }}>
                            💗 💖 💗 💖 💗
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
