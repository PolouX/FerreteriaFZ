import React from 'react'
import EstadisticasPedidos from '../EstadisticasPedidos/EstadisticasPedidos'
import EstadisticasResumen from "../EstadisticasResumen/EstadisticasResumen"
import "./EstadisticasLayout.css"


const EstadisticasLayout = () => {
  return (
    <div className='estadisticas-layout'>
        <EstadisticasPedidos/>
        <EstadisticasResumen/>
    </div>
  )
}

export default EstadisticasLayout