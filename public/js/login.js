
import axios from 'axios';
import {Showalert} from './alert';

export const signUp= async (name, email, password, passwordConfirm)=>{
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        });
        if(res.data.status==='Success'){
            Showalert('success','Account created successfully');
            window.setTimeout( ()=>{
                location.assign('/');
            }, 1500);
        }
        console.log(res);

    } catch(err){
        console.log(err);
    }
} 

export const login =  async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        if(res.data.status==='Success'){
            Showalert('success','Log in successfully');
            window.setTimeout( ()=>{
                location.assign('/');
            }, 1500);
        }
        console.log(res);

    }catch (err) {
        //console.log(err);
        Showalert('error', err.response.data.message);
    }
}

export const logout = async()=>{
    try{
        console.log('logging out')
        const res= await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',
        })
        if(res.data.status=='success'){
            location.assign('/');
        }
    }catch(err){
        //console.log(err);
        Showalert('error', 'Cannot Log out, Try after some time!')
    }
}