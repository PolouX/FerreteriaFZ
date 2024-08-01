import React, { useState } from 'react';
import './Login.css';
import { LiaUserShieldSolid } from "react-icons/lia";
import { useNavigate } from 'react-router-dom';

import { db } from '../../firebaseConfig';
import { doc, getDocs, collection, query, where } from 'firebase/firestore';


const Login = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(inputValue);

    const usuarios = collection(db, "usuarios");
    const q = query(usuarios, where('contrasena', '==', inputValue));

    try {
      // Ejecuta la consulta y espera los resultados
      const querySnapshot = await getDocs(q);

      
      if (querySnapshot.empty) {
        setError("Contraseña incorrecta")
        console.log(error);
      } else {
        
        const doc = querySnapshot.docs[0];
        navigate("/admin/usuarios")
      }
    } catch (err) {
      console.log('Error buscando el usuario:', err.message);
    }
  };

  return (
    <>
      <div className="content">
        <div className="wrapper">
          <form onSubmit={handleLogin}>
            <div className="heading">
              <img src="./src/Assets/Logo.png" alt="Logo de ferreterias zapopan" width='50px' />
              <h1>¡Inicia sesión!</h1>
              <p>Ingresa tus datos para continuar.</p>
            </div>

            <div className="contra">
              <p>Contraseña</p>
              <div className="input-container">
                <LiaUserShieldSolid className='icon' />
                <input
                  type="password"
                  onChange={handleInputChange}
                  placeholder='Ingrese su contraseña...'
                  required
                />
              </div>
            </div>

            <button className="login_boton" type='submit'>Iniciar sesión</button>
          </form>
        </div>
      </div>
      <div className="gradiante">
        <div className="titulo">
          <h1>¡Bienvenido de vuelta!</h1>
          <p>Gestiona tus pedidos con facilidad: crea, revisa, surte y factura de manera eficiente.</p>
        </div>
        <img src="./src/Assets/Dashboard.png" alt="" />
      </div>
    </>
  );
}

export default Login;
