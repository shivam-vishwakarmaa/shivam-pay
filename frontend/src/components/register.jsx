import axios from 'axios' ;
import { useState } from "react";

export default () => {

  const [form, setFormdata] = useState({
    name : '',
    username : '',
    password : ''
  });
  const [response,setResponse] = useState('');

  const handleRegiester = async () => {
    setResponse("Loading...") ;

    const Registercall = await axios.post(
      "http://localhost:3000/pytm/register/enter",
      form
    );

    if(Registercall.data.user)
        setResponse(`congratulation ${Registercall.data.user.name} you have created you account `) ;
    else  setResponse(Registercall.data.message) ;

  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter name"
        value={form.name}
        onChange={(e) => setFormdata({
            ...form,
            name : e.target.value
        })}
      /> <br />
      <input
        type="text"
        placeholder="Enter username"
        value={form.username}
        onChange={(e) => setFormdata({
            ...form,
            username : e.target.value
        })}
      /> <br />
      <input
        type="text"
        placeholder="Enter password"
        value={form.password}
        onChange={(e) => setFormdata({
            ...form,
            password : e.target.value
        })}
      /> <br />
      <button onClick = {handleRegiester}>send</button>
      <h1>{response}</h1>
    </div>
  );
};
