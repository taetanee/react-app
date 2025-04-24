import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import AboutPage from "../Pages/AboutPage";
import ContactPage from "../Pages/ContactPage";
import StartPage from "../Pages/StartPage";

export default function Router() {
    return (
        <BrowserRouter>
            <nav>
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/'>
                    Start
                </NavLink>
                 /
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/about'>
                    About
                </NavLink>
                /
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " click" : "")} to='/contact'>
                    Contact
                </NavLink>
            </nav>

            <Routes>
                <Route exact path='/' element={<StartPage/>}/>
                <Route path='/about' element={<AboutPage/>}/>
                <Route path='/contact' element={<ContactPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}