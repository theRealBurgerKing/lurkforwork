import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

let token = localStorage.getItem('lurkforwork_token');

//send POST request to backend
function apiCall(path, method, data) {
    return new Promise((resolve,reject)=>{
        fetch(`http://localhost:${BACKEND_PORT}/${path}`, {
            method: method,
            body: method ==='GET' ? undefined : JSON.stringify(data),
            headers: {
                'Content-type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : undefined,
            }
        }).then((response) => {
            response.json().then((data) => {
                if (response.status === 200) {
                    resolve(data);
                } else {
                    reject(data.error);
                }
            });
        });  
    })
    
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
    apiCall(
        'auth/register',
        'POST',
        {
            email: email,
            password: password,
            name: name,
        },
    ).then((data)=>{
            localStorage.setItem('lurkforwork_token', data.token);
            showPage('feed');
        });
});

//login
document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password1').value;
    apiCall(
        'auth/login',
        'POST',
        {
            email: email,
            password: password,
        }
    ).then((data)=>{
            localStorage.setItem('lurkforwork_token', data.token);
            showPage('feed');
        }
    );
});


document.getElementById('btn-logout').addEventListener('click',()=>{
    localStorage.removeItem('lurkforwork_token');
    showPage('register');
});

//show page with pageName and hide other
const showPage = (pageName)=>{
    const pages = document.querySelectorAll('.page');
    for (const page of pages){
        page.classList.add('hide');
    }
    document.getElementById(`page-${pageName}`).classList.remove('hide');
    if(pageName==='feed'){
        loadFeed();
    }
};

const loadFeed = () => {
    apiCall('job/feed?start=0', 'GET', {}).then((data)=>{
      let string = '';
      for (const job of data) {
        string += job.description;
        string += ' || ';
      }
      document.getElementById('feed-content').innerText = string;
    console.log(data);
    });
  };
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

if(token){
    showPage('feed');
}
else{
    showPage('register');
}
console.log('lurkforwork_token',localStorage.getItem('lurkforwork_token'));