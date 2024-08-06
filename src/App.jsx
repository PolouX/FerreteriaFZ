import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Usuarios from './Pages/Admin/Usuarios/Usuarios';
import Pedidos from './Pages/Admin/Pedidos/Pedidos';
import Estadisticas from './Pages/Admin/Estadisticas/Estadisticas';
import Clientes from './Pages/Admin/Clientes/Clientes';
import Inventario from './Pages/Admin/Inventario/Inventario';
import Credito from './Pages/Admin/Credito/Credito';
import Sidebar from './Components/Sidebar/Sidebar';
import Header from './Components/Header/Header';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './AuthContext';

function App() {
  const Layout = () => {
    return (
      <div>
        <Sidebar />
        <Header />
        <div>
          <Routes className="app-content">
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
          <Route path="/" element={<Login />} />
          <Route path="/admin/*" element={<ProtectedRoute><Layout /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
