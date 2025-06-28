import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/auth/users').then(res => setUsers(res.data));
  }, []);

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map(u => <li key={u.id}>{u.username} - {u.role}</li>)}
      </ul>
    </div>
  );
}