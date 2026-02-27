import axios from "axios";
import { useState } from "react"
// const token = i
export default () => {
    const [users,allUsers] = useState("No user Found") ;
    const fecthUser = async() => {
        const users = await axios.get(
            "",
            hea
        )
    } 
    return (
        <div>
            <h1>welcome to cum cum app !!!</h1>
            <button>send Money</button><br />
            <hr /> <br />

        </div>
    )
}