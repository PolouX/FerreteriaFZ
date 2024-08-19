import React, { useState, useEffect } from 'react';
import "./AddUser.css";
import { IonIcon } from "@ionic/react";
import { GoPackageDependencies } from "react-icons/go";
import { LiaUserShieldSolid } from "react-icons/lia";
import { cubeOutline, chatbubbleOutline, walletOutline } from 'ionicons/icons';
import { RiCustomerService2Line } from "react-icons/ri";

const AddUser = ({ selectedUser }) => {
  const [addNombre, setAddNombre] = useState('');
  const [addApellido, setAddApellido] = useState('');
  const [addContra, setAddContra] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    if (selectedUser) {
      setAddNombre(selectedUser.nombre);
      setAddApellido(selectedUser.apellido);
      setAddContra(selectedUser.contrasena);
      setSelectedRoles(selectedUser.permisos.split(', '));
    }
  }, [selectedUser]);

  const isSelected = (role) => selectedRoles.includes(role);

  return (
    <form className="newuser-card">
      <h2>Información de usuario</h2>
      <div className="adduser-datos">
        <div className="adduser-nombre">
          <input 
            type="text" 
            placeholder='Nombre...' 
            value={addNombre}
            readOnly
          />
        </div>
        <div className="adduser-apellido">
          <input 
            type="text" 
            placeholder='Apellido...' 
            value={addApellido}
            readOnly
          />
        </div>
      </div>
      <div className="adduser-roles">
        <p>Permisos:</p>
        <div className="adduser-roles-row1">
          <div className="adduser-rolebutton">
            <button
              type="button"
              className={`adduser-roleicon ${isSelected('zonaA') ? 'selected' : ''}`}
              id='zonaA'
              disabled
            >
              A
            </button>
            <span>Zona A</span>
          </div>
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='zonaBC'
              className={`adduser-roleicon ${isSelected('zonaBC') ? 'selected' : ''}`}
              disabled
            >
              BC
            </button>
            <span>Zona BC</span>
          </div>
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='empaquetado'
              className={`adduser-roleicon ${isSelected('empaquetado') ? 'selected' : ''}`}
              disabled
            >
              <GoPackageDependencies />
            </button>
            <span>Empaquetado</span>
          </div>
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='jefeAlmacen'
              className={`adduser-roleicon ${isSelected('jefeAlmacen') ? 'selected' : ''}`}
              disabled
            >
              <IonIcon icon={cubeOutline} />
            </button>
            <span>Jefe de Almacén</span>
          </div>
        </div>
        <div className="adduser-roles-row2">
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='credito'
              className={`adduser-roleicon ${isSelected('credito') ? 'selected' : ''}`}
              disabled
            >
              <IonIcon icon={walletOutline} />
            </button>
            <span>Crédito</span>
          </div>
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='clientes'
              className={`adduser-roleicon ${isSelected('clientes') ? 'selected' : ''}`}
              disabled
            >
              <IonIcon icon={chatbubbleOutline} />
            </button>
            <span>Atención a Clientes</span>
          </div>
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='jefeAtencionClientes'
              className={`adduser-roleicon ${isSelected('jefeAtencionClientes') ? 'selected' : ''}`}
              disabled
            >
              <RiCustomerService2Line />
            </button>
            <span>Jefa de Atención a Clientes</span>
          </div>
          <div className="adduser-rolebutton">
            <button
              type="button"
              id='admin'
              className={`adduser-roleicon ${isSelected('Admin') ? 'selected' : ''}`}
              disabled
            >
              <LiaUserShieldSolid />
            </button>
            <span>Admin</span>
          </div>
        </div>
      </div>
      <div id="adduser-lrg">
        <input 
          type="text" 
          placeholder='Contraseña...' 
          value={addContra}
          readOnly
        />
      </div>
    </form>
  );
};

export default AddUser;
