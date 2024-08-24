import React from 'react'
import ClientesHeader from '../ClientesHeader/ClientesHeader'
import ClientesPedidos from '../ClientesPedidos/ClientesPedidos'
import "./ClientesLayout.css"


const ClientesLayout = () => {
  return (
    <>
        <ClientesHeader />
        <ClientesPedidos />
    </>
  )
}

export default ClientesLayout