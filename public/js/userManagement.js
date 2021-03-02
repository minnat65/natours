import axios from 'axios';
import { Showalert } from './alert';
const catchAsync = require('./../../utils/catchAsync');

export const create_user = async (name, email, password, passwordConfirm)=>{
    try{
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users',
            data:{
                name,
                email,
                password,
                passwordConfirm
            }
        })
        
        if(res.data.status==='success'){
            Showalert('success','User created successfully');
            window.setTimeout( ()=>{
                location.assign('/manage-users');
            }, 1500);
        }
    } catch(err){
        console.log(err);
    }
}

export const update_user = async (name, email, userID)=>{
    try{
            const rest= await axios({
                method: 'PATCH',
                url: `/api/v1/users/${userID}`,
                data:{
                    name,
                    email
                }
            })
            console.log(rest.data.status);
            if(rest.data.status=='success'){
                Showalert('success','User updated successfully');
                /*window.setTimeout( ()=>{
                    location.assign('/manage-users');
                }, 1500);*/
            }
        
    } catch(err){
        console.log(err)
    }
} 

export const delete_user = async userID =>{
    const res = await axios({
        method: 'DELETE',
        url: `/api/v1/users/${userID}`
    })
    console.log(res.data);
}