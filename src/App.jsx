import "./App.css";
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import Login from './Pages/Login/Login';
import Admin from './Pages/Admin/Admin';
import Credito from './Components/Credito/Credito';
import Clientes from './Pages/ClientesPage/ClientesPage';
import Almacen from './Components/Almacen/Almacen'; // Agregada la importación

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<PrivateRoute requiredRoles={['Admin']}><Admin /></PrivateRoute>} />
          <Route path="/credito" element={<PrivateRoute requiredRoles={['credito']}><Credito showHeader={true} /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute requiredRoles={['clientes']}><Clientes/></PrivateRoute>} />
          <Route path="/almacen" element={<PrivateRoute requiredRoles={['Zona A', 'Zona BC', 'Empaquetado']}><Almacen /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
