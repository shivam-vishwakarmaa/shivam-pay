import { useState } from "react"
import axios from "axios";

export default () => {

    const [form,setForm] = useState({
        username:'',
        password:''
    })

    const [res,setResponse] = useState('') ;

    const handleLogin = async () => {
        setResponse("loding...");

        try{

            const fecthLogin = await axios.put(
                "http://localhost:3000/pytm/login/enter",
                form
            ) ; 

            setResponse(`You have login succesfully !!!`);
            localStorage.setItem("token", fecthLogin.data.token);

        } catch(err){
            setResponse(
                err.response?.data?.message || "Something went wrong, try again"
            )
        }
    }

    return (
        <div>
            <input type="text" value={form.username} placeholder = " Enter username " onChange={ (e)=>setForm({
                ...form,
                username : e.target.value
            })}/> <br />
            <input type="text" value={form.password} placeholder = " Enter password " onChange={ (e)=>setForm({
                ...form,
                password : e.target.value
            })}/>
            <br />
            <button onClick= {handleLogin}> login </button>
            <h1>{res}</h1>
        </div>
    )
}