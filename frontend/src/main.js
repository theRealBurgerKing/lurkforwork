import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

document.getElementById('btn-register').addEventListener('click', () => {
    const email = document.getElementById('register-email').value;
    const name = document.getElementById('register-name').value;
    const password = document.getElementById('register-password1').value;
    const passwordConfirm = document.getElementById('register-password2').value;
    if (password !== passwordConfirm) {
        alert('Passwords don\'t match');
    }
    const fetchResult = fetch(`http://localhost:${BACKEND_PORT}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({
            "email": email,
            "password": password,
            "name": name
        }),
        headers: {
            'Content-type': 'application/json',
        }
    });
    fetchResult.then((result)=>{
        const jsonPromise = result.json();
        jsonPromise.then((data)=>{
            console.log('data',data);
            localStorage.setItem('lurkforwork_token',data.token);
            showPage('feed');
        })
    });
    console.log(fetchResult);
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
