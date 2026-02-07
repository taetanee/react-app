import React from "react";

export default function Page03() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* 1. 상단 프로필 카드 */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-slate-50 to-gray-100 px-8 py-10 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <img
                                alt="profile"
                                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                                src="/images/profile.jpg"
                            />
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-gray-900">김태환</h1>
                                <p className="text-xl text-blue-600 font-medium mt-1">풀스택 개발자</p>
                                <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mt-4 text-sm text-gray-600 font-medium">
                                    <span>📞 010-4836-4717</span>
                                    <span className="hidden sm:block text-gray-300">|</span>
                                    <span>📧 xpxksl@gmail.com</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 기본 정보 그리드 */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                        <section>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">생년월일</h2>
                            <dd class="text-sm font-medium text-gray-900">1988-10-13</dd>
                            <br></br>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">학위</h2>
                            <dd class="text-sm font-medium text-gray-900">한국기술교육대학교 컴퓨터공학 졸업</dd>
                        </section>
                        <section>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">병역</h2>
                            <dd class="text-sm font-medium text-gray-900">군필 (병장 만기전역)</dd>
                            <br></br>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">기타</h2>
                            <dd class="text-sm font-medium text-gray-900">정보처리기사</dd>
                        </section>
                        <section>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">사이트</h2>
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                <a href="http://124.53.139.229:23000" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-500">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                                    홈페이지 : http://124.53.139.229:23000
                                </a>
                                <a href="https://github.com/taetanee" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-black">
                                    <img src="https://github.githubassets.com/favicons/favicon.svg" alt="GH" className="w-4 h-4 opacity-80" />
                                    github : https://github.com/taetanee
                                </a>
                                <a href="https://taetanee.tistory.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-orange-500">
                                    <img src="https://t1.daumcdn.net/tistory_admin/static/top/favicon.ico" alt="TS" className="w-4 h-4" />
                                    티스토리 : https://taetanee.tistory.com
                                </a>
                            </div>
                        </section>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-left">
                        <h2 className="text-xl font-bold text-gray-900 mb-10 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                            개발 경력
                            <span className="ml-3 text-sm font-normal text-gray-400">총 9년 4개월</span>
                        </h2>
                        <div className="space-y-12">
                            {/* 1. 교보문고 */}
                            <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                                <div className="md:w-1/4">
                                    <h3 className="text-xl font-bold text-gray-900">교보문고</h3>
                                    <p className="text-sm text-gray-400 mt-1">2023.06 — 재직중</p>
                                </div>
                                <div className="md:w-3/4">
                                    <div className="space-y-4">
                                        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                                            <li>대고객 알림 플랫폼(문자, 앱푸시, 메일, 알림톡) 개발 및 운영</li>
                                            <li>인터넷교보문고 관리자 사이트 공통 모듈(Spring Security, Library) 설계 및 개발</li>
                                        </ul>
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {['Java', 'Spring Boot', 'Spring Security', 'AWS', 'PostgreSQL', 'Jenkins'].map(tech => (
                                                <span key={tech} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs rounded border border-slate-100">{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>


                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-left mt-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                                    Key Projects
                                </h2>

                                <div className="space-y-12">
                                    {/* 프로젝트 01: 교보문고 통합 알림 플랫폼 */}
                                    <div className="group">
                                        <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition">
                                                    통합 메시징 시스템(UMS) 고도화 및 표준화
                                                </h3>
                                                <p className="text-gray-500 font-medium mt-1">교보문고 표준아키텍쳐 개발팀 | 2023.08 — 2024.03</p>
                                            </div>
                                            <div className="flex gap-2 mt-4 md:mt-0">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">Architecture</span>
                                                <span className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-full border border-slate-100">Backend</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

                                            {/* Solution: 해결책 */}
                                            <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                                                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <span className="p-1 bg-blue-100 text-blue-600 rounded">✅</span> Solution
                                                </h4>
                                                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                                                    <li>Spring Boot 기반의 **통합 API Gateway** 설계</li>
                                                    <li>RabbitMQ 도입을 통한 **비동기 메시징 큐 처리**</li>
                                                    <li>공통 Library화를 통한 인터페이스 표준화</li>
                                                </ul>
                                            </div>

                                            {/* Result: 성과 */}
                                            <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                                                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <span className="p-1 bg-green-100 text-green-600 rounded">📈</span> Result
                                                </h4>
                                                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside font-medium">
                                                    <li className="text-indigo-600">메시지 발송 성공률 99.9% 달성</li>
                                                    <li>신규 알림 채널 연동 공수 **50% 절감**</li>
                                                    <li>대량 발송 처리 속도 **3배 향상**</li>
                                                </ul>
                                            </div>
                                        </div>

                                        {/* 활용 기술 요약 */}
                                        <div className="mt-6 flex flex-wrap gap-2">
                                            {['Java 17', 'Spring Boot 3.x', 'RabbitMQ', 'PostgreSQL', 'Redis', 'Docker'].map(tag => (
                                                <span key={tag} className="text-[11px] font-semibold text-gray-400">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <hr className="border-gray-100" />

                            {/* 2. 웰스가이드 */}
                            <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                                <div className="md:w-1/4">
                                    <h3 className="text-xl font-bold text-gray-900">웰스가이드</h3>
                                    <p className="text-sm text-gray-400 mt-1">2021.06 — 2023.05</p>
                                </div>
                                <div className="md:w-3/4">
                                    <div className="space-y-4">
                                        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                                            <li>AI 연금 관리 앱 '마이머플러' 백엔드 시스템 개발</li>
                                            <li>AI 자산 관리 서비스 백오피스 풀스택 개발</li>
                                            <li>ChatGPT API를 활용한 서비스 기능 구현 및 Azure 클라우드 운영</li>
                                        </ul>
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {['Python', 'ChatGPT API', 'Azure', 'MySQL', 'JUnit', 'Thymeleaf'].map(tech => (
                                                <span key={tech} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs rounded border border-slate-100">{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* 3. 알엠소프트 */}
                            <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                                <div className="md:w-1/4">
                                    <h3 className="text-xl font-bold text-gray-900">알엠소프트</h3>
                                    <p className="text-sm text-gray-400 mt-1">2019.02 — 2021.04</p>
                                </div>
                                <div className="md:w-3/4">
                                    <div className="space-y-4">
                                        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                                            <li>기록관리 솔루션 제품 개발</li>
                                            <li>국가철도공단, 인천국제공항공사 기록관리시스템 개발 및 운영</li>
                                        </ul>
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {['Spring Boot', 'Oracle', 'jQuery', 'Gradle', 'Jenkins'].map(tech => (
                                                <span key={tech} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs rounded border border-slate-100">{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* 4. 해커스어학원 */}
                            <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                                <div className="md:w-1/4">
                                    <h3 className="text-xl font-bold text-gray-900">해커스어학원</h3>
                                    <p className="text-sm text-gray-400 mt-1">2015.12 — 2018.04</p>
                                </div>
                                <div className="md:w-3/4">
                                    <div className="space-y-4">
                                        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                                            <li>정산 시스템 및 전자상거래 핵심 기능 개발 및 운영</li>
                                            <li>해커스 토익 인강 사이트 전면 개편 프로젝트 참여</li>
                                            <li>대규모 트래픽 대응을 위한 프로모션 이벤트 페이지 개발</li>
                                        </ul>
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {['Java', 'JavaScript', 'jQuery', 'MSSQL'].map(tech => (
                                                <span key={tech} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs rounded border border-slate-100">{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>




                </div>
            </div>
        </div>
    );
}