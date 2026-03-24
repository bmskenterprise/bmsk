import React,{useState} from 'react';
import {Form} from 'react-bootstrap';

export default function APIForm ({initialFormData, submitHandler}){
    //const {id,title, min, max, key, URL,isActive} = initialFormData;
    const [formData,setFormData]=useState(initialFormData);
    const [errors,setErrors]=useState({});
    const handleChange = (e) => setFormData({...formData,[e.target.name]:e.target.value.trim()});
    
    const formSubmit = e=>{
        e.preventDefault();
        submitHandler(/*{title: e.target[0].value, min: e.target[1].value, max: e.target[2].value, autoAmount: e.target[3].value, isProtected: e.target[4].checked, isActive: e.target[5].checked}*/formData,initialFormData.id);
    };
    
    return <Form onSubmit={formSubmit}>
            <Form.Group>
                <Form.Label>API Title</Form.Label>
                <Form.Control type="text" value={formData.title} placeholder="" required onChange={handleChange}/>
                <Form.Feedback type='invalid'>{errors.title && errors.title}</Form.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Label>API UserId</Form.Label>
                <Form.Control type="text" value={formData.merchantID} placeholder="" required onChange={handleChange}/>
                <Form.Feedback type='invalid'>{errors.userId && errors.userId}</Form.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Label>API Key</Form.Label>
                <Form.Control type="text" value={formData.key} placeholder="" required onChange={handleChange}/>
                <Form.Feedback type='invalid'>{errors.key && errors.key}</Form.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Label>API URL</Form.Label>
                <Form.Control type="text" value={formData.URL} placeholder="https://api.example.com" required onChange={handleChange}/>
                <Form.Feedback type='invalid'>{errors.url && errors.url}</Form.Feedback>
            </Form.Group>
            <div>
                <input type="checkbox" name="" id="active" checked={isActive} /><label htmlFor="active">Active</label>
            </div>
            <input type="submit" value="submit" />
        </Form>
}
