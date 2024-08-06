import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Usuarios from './Pages/Admin/Usuarios/Usuarios';
import Pedidos from './Pages/Admin/Pedidos/Pedidos';
import Estadisticas from './Pages/Admin/Estadisticas/Estadisticas';
import Clientes from './Pages/Admin/Clientes/Clientes';
import Inventario from './Pages/Admin/Inventario/Inventario';
import Credito from './Pages/Admin/Credito/Credito';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from './AuthContext';
import Sidebar from './Components/Sidebar/Sidebar';
import Header from './Components/Header/Header';
import "./App.css"

const App = () => {
  const Layout = () => {
    return (
      <div className="app_layout">
        <Sidebar />
        <Header />
        <div className="app_content">
          <Routes>
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="credito" element={<Credito />} />
          </Routes>
        </div>
      </div>
    );
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<PrivateRoute><Layout /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
