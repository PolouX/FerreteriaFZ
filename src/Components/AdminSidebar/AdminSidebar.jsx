import React, { useState } from 'react'; 
import { Link, useLocation } from 'react-router-dom';
import './AdminSidebar.css';
import {IonIcon} from "@ionic/react";
import { cubeOutline, pieChartOutline, peopleOutline, layersOutline, walletOutline, chatbubblesOutline, notificationsOutline } from 'ionicons/icons';
import { RiCustomerService2Line } from "react-icons/ri";

const Sidebar = () => {
  const location = useLocation();
  const [selected, setSelected] = useState(location.pathname);

  const handleClick = (path) => {
    setSelected(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar_elementos">
        <Link 
          to="/admin/pedidos"
          onClick={() => handleClick("/admin/pedidos")}
        >
          <IonIcon icon={cubeOutline} className={`sidebar_icon sidebar_first ${selected === "/admin/pedidos" ? "sidebar_seleccionado" : ""}`}/>
        </Link>
        <Link 
          to="/admin/estadisticas"
          onClick={() => handleClick("/admin/estadisticas")}
        >
            <IonIcon icon={pieChartOutline} className={`sidebar_icon ${selected === "/admin/estadisticas" ? "sidebar_seleccionado" : ""}`} />
        </Link>
        <Link 
          to="/admin/usuarios"
          onClick={() => handleClick("/admin/usuarios")}
        >
            <IonIcon icon={peopleOutline} className={`sidebar_icon ${selected === "/admin/usuarios" ? "sidebar_seleccionado" : ""}`} />
        </Link>
        <Link 
          to="/admin/clientes"
          onClick={() => handleClick("/admin/clientes")}
        >
            <IonIcon icon={chatbubblesOutline} className={`sidebar_icon ${selected === "/admin/clientes" ? "sidebar_seleccionado" : ""}`} />
        </Link>
        <Link 
          to="/admin/inventario"
          onClick={() => handleClick("/admin/inventario")}
        >
            <IonIcon icon={layersOutline} className={`sidebar_icon ${selected === "/admin/inventario" ? "sidebar_seleccionado" : ""}`} />
        </Link>
        <Link 
          to="/admin/credito"
          onClick={() => handleClick("/admin/credito")}
        >
            <IonIcon icon={walletOutline} className={`sidebar_icon ${selected === "/admin/credito" ? "sidebar_seleccionado" : ""}`} />
        </Link>
      </div>
      <IonIcon icon={notificationsOutline} className="sidebar_icon sidebar_notificaciones"/>
    </div>
  );
};

export default Sidebar;
