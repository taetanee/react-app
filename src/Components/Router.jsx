import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Main from "../Pages/Main";
import Page01 from "../Pages/Page01";
import Page02 from "../Pages/Page02";
import Page03 from "../Pages/Page03";

export default function Router() {
    return (
        <BrowserRouter>
            <nav>
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/'>
                    메인
                </NavLink>
                /
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/page01'>
                    데이터 가져오기1
                </NavLink>
                /
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/page02'>
                    데이터 가져오기2
                </NavLink>
                /
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/page03'>
                    미구현 Page03
                </NavLink>
            </nav>

            <Routes>
                <Route exact path='/' element={<Main/>}/>
                <Route path='/page01' element={<Page01/>}/>
                <Route path='/page02' element={<Page02/>}/>
                <Route path='/page03' element={<Page03/>}/>
            </Routes>
        </BrowserRouter>
    );
}