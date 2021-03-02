import axios from 'axios';
import { Showalert } from './alert';

const catchAsync = require('./../../utils/catchAsync');

//type will be either 'password' or 'data' 
export const updateSettings = catchAsync(async (data, type) => {
    try {
        const url = type == 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/updateMe';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        })
        
        if (res.data.status == 'success') {
            console.log(res.data.status);
            Showalert('success', ` ${type.toUpperCase()} updated successfully`)
        }

    } catch (err) {
        Showalert('error', err.response.data.message);
    }
})