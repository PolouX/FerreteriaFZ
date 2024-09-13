import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import ClientesLayout from '../../Components/Clientes/ClientesLayout/ClientesLayout';
import Pedidos from '../../Components/Pedidos/Pedidos';
import Credito from '../../Components/Credito/Credito'; // Sin Header
import UserLayout from '../../Components/Usuarios/UserLayout/UserLayout';
import Inventario from '../../Components/Inventraio/Inventario';
import EstadisticasLayout from '../../Components/Estadisticas/EstadisticasLayout/EstadisticasLayout';
import "./Admin.css";

const Admin = () => {
  return (
    <div className="admin_layout">
      <AdminSidebar />
      <div className="admin_content">
        {/* Renderizar el Header solo si no estás en la ruta específica de crédito */}
        <Header />
        <Routes>
          <Route path="usuarios" element={<UserLayout />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="estadisticas" element={<EstadisticasLayout />} />
          <Route path="clientes" element={<ClientesLayout />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="credito" element={<Credito />} />
        </Routes>
      </div>
    </div>
  );
}

export default Admin;
