import React,{ useEffect, useState } from "react";
import {Button} from "react-bootstrap";
import APIForm from "../../components/APIForm";

export default  () =>{
    const [formInit,setFormInit] = useState(false);
    const fields = [''];
    const [APIs, setAPIs] = useState([]);
    const [init, setInit] = useState(false);const initialData = {};
    useEffect(()=>{
        /*fetch('/api')
            .then(res=>res.json())
            .then(data=>setAPIs(data))*/
    },[APIs.length])

    const submit = async(data,id)=>{
        // e.preventDefault();
        try{
            let res= await fetch(`http://localhost:3001/services/${id??''}`,{
                method: id?'PATCH':'POST',
                headers: {'Content-Type':'application/json'},
                credentials: 'include',//    
                body: JSON.stringify(data)
            
            })
        }catch(err){}
        setFormInit(false);
    };



    return <div>
        <h4 style={{marginBottom: '3rem'}}>API Settings</h4>
        {!init && <Button>Add API</Button>}
        {init && <APIForm initialFormData={initialData} submitHandler={submit}  />}
        {!init && <table>
            <tr>{fields.map((f,i)=> <th key={i}>{f}</th>)}</tr>
            {APIs.map(({title, key, url})=> <tr>
                <td>{title}</td>
                <td>{key}</td>
                <td>{url}</td>
            </tr>)}
        </table>}
    </div>
}
