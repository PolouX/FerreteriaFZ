import "./App.css";
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import Login from './Pages/Login/Login';
import Admin from './Pages/Admin/Admin';
import Credito from './Components/Credito/Credito';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<PrivateRoute requiredRoles={['Admin']}><Admin /></PrivateRoute>} />
          {/* Mostrar Header en la vista de /credito */}
          <Route path="/credito" element={<PrivateRoute requiredRoles={['credito']}><Credito showHeader={true} /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
