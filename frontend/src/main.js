import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

//let token = localStorage.getItem('lurkforwork_token');

//Error popup
const showErrorModal = (message) => {
    const modal = new bootstrap.Modal(document.getElementById('error-modal'));
    document.getElementById('error-message').textContent = message;
    modal.show();
};

//send request to backend
function apiCall(path, method, data) {
    return new Promise((resolve,reject)=>{
        const token = localStorage.getItem('lurkforwork_token');
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
        showErrorModal("Passwords don't match");
        return;
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
        })
    .catch((error) => {
        showErrorModal(error);
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
    })
    .catch((error) => {
        showErrorModal(error);
    });
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

const formatTimeAgo = (createdAt) => {
    const now = new Date();
    const postDate = new Date(createdAt);
    const diffMs = now - postDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 24) {
        return `${diffHours} hours and ${diffMinutes} minutes ago`;
    } else {
        const day = String(postDate.getDate()).padStart(2, '0');
        const month = String(postDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = postDate.getFullYear();
        return `${day}/${month}/${year}`;
    }
};
const loadFeed = () => {
    apiCall('job/feed?start=0', 'GET', {}).then((data) => {
        const sortedJobs = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        let feedHtml = '';
        for (const job of sortedJobs) {
            const postedBy = job.creatorId || 'Unknown User'; // Assuming userName is available; adjust if needed
            const postedTime = formatTimeAgo(job.createdAt);
            const likesCount = job.likes ? job.likes.length : 0;
            const commentsCount = job.comments ? job.comments.length : 0;
            let commentsHtml = '';
            if (job.comments && job.comments.length > 0) {
                commentsHtml = '<div class="comments"><h4>Comments:</h4><ul>';
                for (const comment of job.comments) {
                    commentsHtml += `<li><strong>${comment.userName}:</strong> ${comment.comment}</li>`;
                }
                commentsHtml += '</ul></div>';
            } else {
                commentsHtml = '<p>No comments yet.</p>';
            }
            feedHtml += `
                <div class="job-post">
                    <img src="${job.image}" alt="${job.title}" style="max-width: 100%;">
                    <h3>${job.title}</h3>
                    <p><strong>Posted by:</strong> ${postedBy}</p>
                    <p><strong>Posted:</strong> ${postedTime}</p>
                    <p><strong>Start Date:</strong> ${job.start.split('T')[0].split('-').reverse().join('/')}</p>
                    <p><strong>Likes:</strong> ${likesCount}</p>
                    <p>${job.description}</p>
                    <p><strong>Comments:</strong> ${commentsCount}</p>
                    ${commentsHtml}
                    <hr>
                </div>
            `;
        }
        document.getElementById('feed-content').innerHTML = feedHtml;
    }).catch((error) => {
        showErrorModal(error);
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

if(localStorage.getItem('lurkforwork_token')){
    showPage('feed');
}
else{
    showPage('register');
}
console.log('lurkforwork_token',localStorage.getItem('lurkforwork_token'));