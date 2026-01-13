import { useState } from 'react';
import Register from './components/register';
import Login from './components/login';

function App() {
  const [page, setPage] = useState(null); 

  return (
    <>
      <h1>Welcome to ShivamPay !!!</h1>

      <button onClick={() => setPage('register')}>
        Register
      </button>

      <button onClick={() => setPage('login')}>
        Login
      </button>

      <hr />

      {page === 'register' && <Register />}
      {page === 'login' && <Login />}
    </>
  );
}

export default App;
