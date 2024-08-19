import React from 'react'
import "./Clientes.css"

const Clientes = () => {
  return (
    <>
      <div className="clientes-header">
        <div className="clientes-left-filters">
          <button>Activos</button>
          <button>Facturas</button>
        </div>
        <div className="right-filters">
          <input type="text" placeholder='Buscar un pedido...'/>
          <button></button>
          <button></button>
          <button></button>
        </div>
      </div>
      <div className="clientes-content">
      </div>
    </>
  )
}

export default Clientes