import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Main from "../Pages/Main";
import Page01 from "../Pages/Page01";
import Page02 from "../Pages/Page02";

export default function Router() {
    return (
        <BrowserRouter>
            <nav style={{
                padding: '10px 0',
                backgroundColor: '#f8f8f8', // 배경색 추가
                borderBottom: '2px solid #eee', // 구분선
                textAlign: 'center'
            }}>
                <NavLink
                    style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#007bff' : '#333', // 활성화 시 파란색
                        fontWeight: isActive ? 'bold' : 'normal',
                        padding: '8px 15px',
                        margin: '0 5px',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease-in-out',
                        backgroundColor: isActive ? '#e9f5ff' : 'transparent', // 활성화 시 연한 배경
                    })}
                    to='/'
                >
                    나만의 대시보드
                </NavLink>
                <NavLink
                    style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#007bff' : '#333',
                        fontWeight: isActive ? 'bold' : 'normal',
                        padding: '8px 15px',
                        margin: '0 5px',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease-in-out',
                        backgroundColor: isActive ? '#e9f5ff' : 'transparent',
                    })}
                    to='/page01'
                >
                    온라인 클립보드
                </NavLink>
                <NavLink
                    style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#007bff' : '#333',
                        fontWeight: isActive ? 'bold' : 'normal',
                        padding: '8px 15px',
                        margin: '0 5px',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease-in-out',
                        backgroundColor: isActive ? '#e9f5ff' : 'transparent',
                        // 미구현 항목을 살짝 흐리게 표시
                        opacity: 0.6
                    })}
                    to='/page02'
                >
                    오픈AI(미구현)
                </NavLink>
            </nav>

            <Routes>
                <Route exact path='/' element={<Main/>}/>
                <Route path='/page01' element={<Page01/>}/>
                <Route path='/page02' element={<Page02/>}/>
            </Routes>
        </BrowserRouter>
    );
}