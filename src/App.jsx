import React, { useState } from 'react';
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Usuarios from './Pages/Admin/Usuarios/Usuarios';
import Sidebar from './Components/Sidebar/Sidebar';
import Header from './Components/Header/Header';

function App() {

  const Layout = () => {
    return(
      <div className="app_layout">
        <Sidebar />
        <div className='app_content'>
          <Header />
          <Routes>
            <Route path="usuarios" element={<Usuarios />} />
          </Routes>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/*" element={<Layout />} />
      </Routes>
    </Router>
  )
}

export default App;
