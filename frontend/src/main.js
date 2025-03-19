import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';


function apiCall(path, data) {
    fetch(`http://localhost:${BACKEND_PORT}/${path}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
        'Content-type': 'application/json',
        }
    }).then((response) => {
        response.json().then((data) => {
        if (response.status === 200) {
            localStorage.setItem('lurkforwork_token', data.token);
            showPage('feed');
        } else {
        alert(data.error);
        }
    });
    });
}
//register
document.getElementById('btn-register').addEventListener('click', () => {
    const email = document.getElementById('register-email').value;
    const name = document.getElementById('register-name').value;
    const password = document.getElementById('register-password1').value;
    const passwordConfirm = document.getElementById('register-password2').value;
    if (password !== passwordConfirm) {
        alert('Passwords don\'t match');
    }
    apiCall('auth/register',{
        "email": email,
        "password": password,
        "name": name,
    })
});

//login
document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password1').value;
    apiCall('auth/login',{
        "email": email,
        "password": password,
    })
});


document.getElementById('btn-logout').addEventListener('click',()=>{
    localStorage.removeItem('lurkforwork_token');
    showPage('register');
})
const showPage = (pageName)=>{
    const pages = document.querySelectorAll('.page');
    for (const page of pages){
        page.classList.add('hide');
    }
    document.getElementById(`page-${pageName}`).classList.remove('hide');
}
for (const atag of document.querySelectorAll('a')) {
    if (atag.hasAttribute('internal-link')) {
        atag.addEventListener('click', () => {
            const pageName = atag.getAttribute('internal-link');
            // console.log('pageName', pageName);
            showPage(pageName);
        });
    }
}

//When Page load
let token = localStorage.getItem('lurkforwork_token');
if(token){
    showPage('feed');
}
else{
    showPage('register');
}
console.log('lurkforwork_token',localStorage.getItem('lurkforwork_token'));