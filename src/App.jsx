import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './Pages/Login/Login'
import Usuarios from './Pages/Admin/Usuarios/Usuarios';
import Sidebar from './Components/Sidebar/Sidebar';
import Header from './Components/Header/Header';

function App() {

  const Layout = () => {
    return(
      <div>
        <Sidebar />
        <Header />
        <div>
          <Routes className="app-content">
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

export default App
