import React from 'react'
import './Login.css'
import { LiaUserShieldSolid } from "react-icons/lia";
import { useNavigate } from 'react-router-dom';

const Login = () => {

  const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/admin/usuarios');
  };

  return (
    <>
      <div className="content">
        <div className="wrapper">
          <form action="">
            <div className="heading">
              <img src="./src/Assets/Logo.png" alt="Logo de ferreterias zapopan" width='50px'/>
              <h1>¡Inicia sesión!</h1>
              <p>Ingresa tus datos para continuar.</p>
            </div>

            <div className="contra">
              <p>Contraseña</p>
              <div className="input-container">
                <LiaUserShieldSolid className='icon'/>
                <input type="password" placeholder='Ingrese su contraseña...'   required/>
              </div>
            </div>

            <button className="login_boton" type='submit' onClick={handleLogin}>Iniciar sesión</button>
          </form>
        </div>
      </div>
      <div className="gradiante">
        <div className="titulo">
          <h1>¡Bienvenido de vuelta!</h1>
          <p>Gestiona tus pedidos con facilidad: crea, revisa, surte y factura de manera eficiente.</p>
        </div>
        <img src="./src/Assets/Dashboard.png" alt=""/>
      </div>    
    </>
  )
}

export default Login
