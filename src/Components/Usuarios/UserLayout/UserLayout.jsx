import React, { useState } from 'react';
import UsersCards from '../UsersCards/UsersCards';
import AddUser from '../AddUser/AddUser';
import './UserLayout.css';

const UserLayout = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="user-layout">
      <UsersCards onSelectUser={setSelectedUser} />
      <AddUser selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
    </div>
  );
};

export default UserLayout;
