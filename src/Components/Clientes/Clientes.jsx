import React from 'react'
import {IonIcon} from "@ionic/react";
import { documentTextOutline, personAddOutline,  searchOutline,  } from 'ionicons/icons';
import "./Clientes.css"

const Clientes = () => {
  return (
    <>
      <div className="clientes-header">
        <div className="clientes-left-filters">
          <button>Activos</button>
          <button>Facturas</button>
        </div>
        <div className="clientes-right-filters">
          <div className="clientes-search">
            <IonIcon icon={ searchOutline } className='clientes-search-icon'/>
            <input type="text" placeholder='Buscar un pedido...' />
          </div>
          <button>
            <IonIcon icon={ personAddOutline } />
          </button>
          <button>
            <IonIcon icon={ documentTextOutline } />
          </button>
          <button> 
            Capturar
          </button>
        </div>
      </div>
      <div className="clientes-content">
      </div>
    </>
  )
}

export default Clientes