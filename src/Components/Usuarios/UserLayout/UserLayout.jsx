import React from 'react'
import UsersCards from '../UsersCards/UsersCards'
import AddUser from '../AddUser/AddUser'
import "./UserLayout.css"

const UserLayout = () => {
  return (
    <>
        <div className="user-layout" >
            <UsersCards className="userlayout-cards"></UsersCards>
            <AddUser className="userlayout-form"></AddUser>
        </div>       
    </>
  )
}

export default UserLayout