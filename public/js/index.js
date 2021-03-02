import '@babel/polyfill';
import axios from 'axios';
import { login, logout, signUp } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { create, uploadCoverImage, updateTour } from './tourManagement';
import { create_user, update_user, delete_user } from './userManagement';
let createdTourId;
//import { createReview } from '../../controllers/reviewControllers';
//import { location } from './'

//DOM elements
const loginForm = document.querySelector('.login_form');
const signupForm = document.querySelector('.signup_form');
const logOutBtn = document.querySelector('.nav__el--logout');
const user = document.querySelector('.me');
const updateUserData = document.querySelector('.form-user-data');
const updateUserPassword = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');
const createTour = document.querySelector('.createTour');
const uploadCover = document.querySelector('.uploadCoverImage');
const selectDate = document.querySelector('.bookDate');
const selectTours = document.getElementById('selecttours');
const updateTourByAdmin = document.querySelector('updateTour')
//const addReview = document.querySelector('.addReview');

//users management
const createuser = document.querySelector('.createUser')
//const updateuser = document.getElementById('updateUser');
const updateuser = document.querySelector(`.updateUser`)
const deleteUser = document.getElementById('deleteUser');

if(deleteUser){
    deleteUser.addEventListener('click', e=>{
        const id = document.querySelector('.x');
        console.log(id);
    })
}

let flag = false;
if (selectDate) {
    selectDate.addEventListener('click', (e) => {
        e.preventDefault();
        flag = true;
        let date = new Date();

        let x = document.createElement("INPUT");
        x.classList.add('dateInput');
        x.setAttribute("type", "date");
        x.setAttribute("value", date.toDateString());
        let z = document.querySelector('.overview-box__detail');
        z.appendChild(x);
    })
}

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;

        signUp(name, email, password, passwordConfirm);
    })
}

if (loginForm) {
    document.querySelector('.form').addEventListener('submit', e => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        //console.log(email, password);
        login(email, password);
    })
}

if (logOutBtn) {

    logOutBtn.addEventListener('click', logout);
}

if (user) {
    user.addEventListener('click', async (e) => {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/getMe'
        })
        if (res.data.status === 'Success') {
            location.assign('/me');
        }
    });
}

if (updateUserData) {
    updateUserData.addEventListener('submit', e => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0]);
        //console.log(form);
        //const name= document.getElementById('name').value;
        //const email= document.getElementById('email').value;
        updateSettings(form, 'data');
    });
}


if (updateUserPassword) {
    updateUserPassword.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save--password').textContent = 'Updating...'

        const Currentpassword = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        await updateSettings({ Currentpassword, password, passwordConfirm }, 'password');
        document.querySelector('.btn--save--password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = ''
    })
}

if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        let date;
        if (flag) {
            date = document.querySelector('.dateInput').value;
            console.log(date);
        }

        if (flag && date) {
            e.target.textContent = 'Processing';
            const tourID = e.target.dataset.tourId;
            bookTour(tourID);
        } else {
            alert('Please select travel date');
        }

    })
}


if (createTour) {
    createTour.addEventListener('submit', async e => {
        e.preventDefault();

        //let form = new FormData();
        /*
                form.append('name', document.getElementById('name').value);
                form.append('duration', document.getElementById('duration').value);
                form.append('maxGroupSize', document.getElementById('maxGroup').value);
                form.append('price', document.getElementById('price').value);
                form.append('difficulty', document.getElementById('difficulty').value.toLowerCase());
                form.append('summary', document.getElementById('summary').value);
                //form.append('imageCover',  document.getElementById('photo').files[0]);
                const lat = document.getElementById('latitude').value;
                const lng = document.getElementById('longitude').value;
                form.append('startDates', [document.getElementById('startdate').value]);
                //let startDates = [document.getElementById('startdate').value];
                let startLocation= {coordinates: [lng, lat]}
                form.append('startLocation', startLocation);
                console.log(startLocation);
                //console.log(form.entries())
                create(form);
                */

        const name = document.getElementById('name').value;
        const duration = document.getElementById('duration').value;
        const maxGroup = document.getElementById('maxGroup').value;
        const difficulty = document.getElementById('difficulty').value.toLowerCase();
        const price = document.getElementById('price').value;
        const summary = document.getElementById('summary').value;
        const description = document.getElementById('description').value;
        //const imageCover = document.getElementById('photo').files[0];
        const lat = document.getElementById('latitude').value;
        const lng = document.getElementById('longitude').value;
        let startDates = [document.getElementById('startdate').value];
        let startLocation = { coordinates: [lng, lat] };
        //form.append('imageCover',  document.getElementById('photo').files[0]);


        //console.log(CoverPhoto);
        create(name, duration, maxGroup, difficulty, price, summary, description, startLocation, startDates);
    })
}

if(selectTours){
    selectTours.addEventListener('click', async e=>{
        e.preventDefault();

        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/tours'
        })
        //console.log(res.data.data.data[0].name);
        createdTourId = res.data.data.data[0]._id;
    })
}

if (uploadCover) {
    uploadCover.addEventListener('submit', e => {
        e.preventDefault();

        let form = new FormData();
        form.append('imageCover', document.getElementById('photo').files[0]);

        uploadCoverImage(form, createdTourId);
    });
}

//user CRUD
if(createuser){
    createuser.addEventListener('submit', e=>{
        e.preventDefault();

        let form = new FormData();

        let name= document.getElementById('name').value;
        let email= document.getElementById('email').value;
        let password= document.getElementById('password').value;
        let passwordConfirm= document.getElementById('passwordConfirm').value;

        create_user(name, email, password, passwordConfirm);
    })
}
if(updateuser){
    updateuser.addEventListener('submit', e=>{
        e.preventDefault();
        console.log('click update')
        const userID = e.target.dataset.userId;
        console.log(userID)
        let name= document.getElementById('name').value;
        let email= document.getElementById('email').value;
        
        update_user(name, email, userID);
    })
}

if(updateTourByAdmin){
    updateTourByAdmin.addEventListener('click', e=>{
        const name = document.getElementById('name').value;
        const duration = document.getElementById('duration').value;
        const maxGroup = document.getElementById('maxGroup').value;
        const difficulty = document.getElementById('difficulty').value.toLowerCase();
        const price = document.getElementById('price').value;
        const summary = document.getElementById('summary').value;
        const description = document.getElementById('description').value;
        const lat = document.getElementById('latitude').value;
        const lng = document.getElementById('longitude').value;
        let startDates = [document.getElementById('startdate').value];
        let startLocation = { coordinates: [lng, lat] };
        
        //console.log(CoverPhoto);
        updateTour(name, duration, maxGroup, difficulty, price, summary, description, startLocation, startDates);
   
    })
}


