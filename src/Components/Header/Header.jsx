import React, { useContext } from 'react';
import "./Header.css";
import { IonIcon } from "@ionic/react";
import { logOutOutline } from 'ionicons/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../AuthContext';

function Header() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  const Content = () => {
    const location = useLocation();

    let header_content;
    switch (location.pathname) {
      case '/admin/pedidos':
        header_content = { titulo: "Pedidos", mensaje: "Consulta la lista de pedidos activos en almacén." };
        break;
      case '/admin/estadisticas':
        header_content = { titulo: "Estadísticas", mensaje: "Consulta las estadísticas por pedido o por usuario." };
        break;
      case '/admin/usuarios':
        header_content = { titulo: "Usuarios", mensaje: "Crea, edita o consulta la lista de usuarios." };
        break;
      case '/admin/clientes':
        header_content = { titulo: "Atención a clientes", mensaje: "Lista de pedidos activos o pendientes de facturar." };
        break;
      case '/admin/inventario':
        header_content = { titulo: "Inventario", mensaje: "Agrega o modifica los productos en el inventario." };
        break;
      case '/admin/credito':
        header_content = { titulo: "Crédito", mensaje: "Solicitudes de pedidos pendientes de autorizar." };
        break;
      default:
        header_content = { titulo: "", mensaje: "" };
    }

    return (
      <div>
        <h2>{header_content.titulo}</h2>
        <p>{header_content.mensaje}</p>
      </div>
    );
  };

  return (
    <div className="header">
      <div className="header_title">
        <Content />
      </div>
      <div className="header_logout">
        <p>¡Bienvenido! </p>
        <button onClick={handleLogout} className="logout_boton">Diego <IonIcon className="logout_icon" icon={logOutOutline} /></button>
      </div>
    </div>
  );
}

export default Header;
