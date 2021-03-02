import axios from 'axios';
import Tour from '../../models/modeltours';
import { Showalert } from './alert';
const catchAsync = require('./../../utils/catchAsync');

//let CreatedTourId;
export const create = async (name, duration, maxGroup, difficulty, price, summary, description, startLocation, startDates)=>{
//export const create = async (data)=>{
    try{
        
        const res = await axios({
            method: 'POST',
            url: '/api/v1/tours',
            data: {
                
                name,
                duration,
                maxGroupSize: maxGroup,
                difficulty,
                price,
                summary,
                description,
                startLocation,
                startDates
            }
        });
        
        console.log(res.data.status);
        if(res.data.status==='success'){
            Showalert('success','Tour created successfully');
            window.setTimeout( ()=>{
                location.assign('/manage-tours/update-tour');
            }, 1500);
        } 
    } catch(err){
        console.log(err);
    }
    
}

export const uploadCoverImage = async (data, CreatedTourId)=>{
    try{
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/tours/${CreatedTourId}`,
            data
        })
        if(res.data.status==='success'){
            Showalert('success','Image Uploaded successfully');
            /*window.setTimeout( ()=>{
                location.assign('/me');
            }, 1500);*/
        }
    } catch(err){
        console.log(err);
    }
}

export const updateTour = async (name, duration, maxGroup, difficulty, price, summary, description, startLocation, startDates)=>{
    //route is not defined for this update.
        window.setTimeout( ()=>{
                location.assign('/manage-tours/get-all-tours');
            }, 500);
}