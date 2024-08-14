import React from 'react';
import Header from '../../Components/Header/Header';
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar';
import Clientes from '../../Components/Clientes/Clientes';
import Pedidos from '../../Components/Pedidos/Pedidos';
import Credito from '../../Components/Credito/Credito';
import UserLayout from '../../Components/Usuarios/UserLayout/UserLayout';
import Inventario from '../../Components/Inventraio/Inventario';
import Estadisticas from '../../Components/Estadisticas/Estadisticas';
import { Routes, Route } from 'react-router-dom';
import "./Admin.css"


const Admin = () => {
  return ( 
    <div className="admin_layout">
      <AdminSidebar />
      <div className="admin_content">
        <Header className='admin-header'/>
        <Routes>
          <Route path="usuarios" element={<UserLayout />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="estadisticas" element={<Estadisticas />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="credito" element={<Credito />} />
        </Routes>
      </div>
    </div>
  )
}

export default Admin