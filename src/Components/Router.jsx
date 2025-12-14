import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Main from "../Pages/Main";
import Page01 from "../Pages/Page01";
import Page02 from "../Pages/Page02";

export default function Router() {
    return (
        <BrowserRouter>
            <nav>
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/'>
                    실시간 현황
                </NavLink>
                /
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/page01'>
                    온라인 클립보드
                </NavLink>
                /
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/page02'>
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