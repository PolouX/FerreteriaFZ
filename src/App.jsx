import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Usuarios from './Pages/Admin/Usuarios/Usuarios';
import Pedidos from './Pages/Admin/Pedidos/Pedidos';
import Estadisticas from './Pages/Admin/Estadisticas/Estadisticas';
import Clientes from './Pages/Admin/Clientes/Clientes';
import Inventario from './Pages/Admin/Inventario/Inventario';
import Credito from './Pages/Admin/Credito/Credito';
import PrivateRoute from './PrivateRoute';
import AuthContext from './AuthContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/admin/pedidos" element={<PrivateRoute><Pedidos /></PrivateRoute>} />
          <Route path="/admin/estadisticas" element={<PrivateRoute><Estadisticas /></PrivateRoute>} />
          <Route path="/admin/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
          <Route path="/admin/inventario" element={<PrivateRoute><Inventario /></PrivateRoute>} />
          <Route path="/admin/credito" element={<PrivateRoute><Credito /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
