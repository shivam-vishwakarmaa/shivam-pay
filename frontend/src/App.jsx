import { useState } from 'react';
import Register from './components/register';
import Login from './components/login';
import Transiction from './components/transictions' ;

function App() {
  const [page, setPage] = useState(null); 

  return (
    <>
      <h1>Welcome to ShivamPay !!!</h1>

     {page === null && (
        <>
          <button onClick={() => setPage('register')}>Register</button>
          <button onClick={() => setPage('login')}>Login</button>
        </>
      )}
      <hr />

      {page === 'register' && <Register gotoTransictoin={ ()=>{ setPage('transiction')}}/>}
      {page === 'login' && <Login gotoTransictoin={ ()=>{ setPage('transiction')}}/>}
      {page === 'transiction' && <Transiction />}
      
    </>
  );
}

export default App;
