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
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">기본 정보</h2>
              <p className="font-semibold text-gray-800">1988.10.13</p>
            </section>
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">학력 및 병역</h2>
              <p className="font-semibold text-blue-600">한국기술교육대학교 컴퓨터공학 졸업</p>
              <p className="text-gray-500 mt-1 text-xs">군필 (병장 만기전역)</p>
            </section>
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">소셜 링크</h2>
              <div className="flex gap-4 font-semibold text-gray-600">
                <a href="#" className="hover:text-black">GitHub</a>
                <a href="#" className="hover:text-blue-600">LinkedIn</a>
                <a href="#" className="hover:text-green-600">Velog</a>
              </div>
            </section>
          </div>
        </div>

        {/* 2. 자기소개 영역 */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
            Introduce
          </h2>
          <p className="text-gray-700 leading-relaxed italic">
            "사용자 경험을 최우선으로 생각하며, 클린 코드와 효율적인 아키텍처를 지향하는 프론트엔드 개발자입니다. 
            새로운 기술을 배우는 것을 즐기며 동료들과 협업하여 문제를 해결할 때 가장 큰 에너지를 얻습니다."
          </p>
        </div>

        {/* 3. 기술 스택 (Tech Stack) */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'Zustand', 'React Query', 'Git'].map((skill) => (
              <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium border border-gray-200">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 4. 개발 경력 (Experience) */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              Experience
            </h2>
            <div className="space-y-6">
              <div className="relative pl-6 border-l-2 border-blue-100">
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
                <h3 className="font-bold text-gray-900 text-lg">OOO 테크 (프론트엔드 인턴)</h3>
                <p className="text-sm text-gray-500 mb-2">2023.09 - 현재</p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc ml-4">
                  <li>사내 어드민 페이지 UI 개선 및 기능 개발</li>
                  <li>컴포넌트 재사용성 40% 향상</li>
                </ul>
              </div>
              <div className="relative pl-6 border-l-2 border-blue-100">
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-gray-300 rounded-full border-4 border-white"></div>
                <h3 className="font-bold text-gray-900 text-lg">OO대학교 웹 동아리</h3>
                <p className="text-sm text-gray-500 mb-2">2021.03 - 2022.02</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}