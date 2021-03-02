/* eslint-disable */

const removeAlert = ()=>{
    const el = document.querySelector('.alert');
    if(el){
        el.parentElement.removeChild(el);
    }
}
//type will be either Success or error
export const Showalert= (type, msg)=>{
    removeAlert();
    const markup= `<div class="alert alert--${type}"> ${msg} </div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(removeAlert, 5000);
}