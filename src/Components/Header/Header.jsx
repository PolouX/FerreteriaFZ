import React from 'react'
import "./Header.css"
import {IonIcon} from "@ionic/react";
import { logOutOutline } from 'ionicons/icons';

import { useNavigate } from 'react-router-dom';

function Header() {

    const navigate = useNavigate();
    const handleLogout = () => {
      navigate('/login');
  };

  return (
    <div className="header">
      <div className="header_title">
        <h1>Usuarios</h1>
        <p>Crea, edita o consulta la lista de usuarios</p>
      </div>
      <div className="header_logout">
        <p>¡Bienvenido! </p>
        <button onClick={handleLogout} className="logout_boton">Diego <IonIcon className="logout_icon" icon={logOutOutline} /></button>
      </div>
    </div>
  )
}

export default Header