import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';


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

//btn-logout
document.getElementById('btn-logout').addEventListener('click',()=>{
    localStorage.removeItem('lurkforwork_token');
    showPage('register');
});

//show page named [pageName] and hide other
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

//calculate diff between now and "createdAt"
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
        const month = String(postDate.getMonth() + 1).padStart(2, '0');
        const year = postDate.getFullYear();
        return `${day}/${month}/${year}`;
    }
};

//feed page
const loadFeed = () => {
    apiCall('job/feed?start=0', 'GET', {}).then((data) => {
        const sortedJobs = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const feedContent = document.getElementById('feed-content');
        feedContent.innerHTML = '';
        for (const job of sortedJobs) {
            const postedBy = job.creatorId || 'Unknown User';
            const postedTime = formatTimeAgo(job.createdAt);
            const likesCount = job.likes ? job.likes.length : 0;
            const commentsCount = job.comments ? job.comments.length : 0;
            const startDateData = job.start.split('T')[0].split('-').reverse().join('/')
            // create job-post container
            const jobPost = document.createElement('div');
            jobPost.className = 'job-post';

            // img
            const img = document.createElement('img');
            img.src = job.image;
            img.alt = job.title;
            img.style.maxWidth = '100%';
            jobPost.appendChild(img);

            // title
            const title = document.createElement('h3');
            title.textContent = job.title;
            jobPost.appendChild(title);

            // Posted by
            const postedByP = document.createElement('p');
            const postedByStrong = document.createElement('strong');
            postedByStrong.textContent = 'Posted by: ';
            postedByP.appendChild(postedByStrong);
            postedByP.appendChild(document.createTextNode(postedBy));
            jobPost.appendChild(postedByP);

            // Posted time
            const postedTimeP = document.createElement('p');
            const postedTimeStrong = document.createElement('strong');
            postedTimeStrong.textContent = 'Posted: ';
            postedTimeP.appendChild(postedTimeStrong);
            postedTimeP.appendChild(document.createTextNode(postedTime));
            jobPost.appendChild(postedTimeP);

            // Start Date
            const startDateP = document.createElement('p');
            const startDateStrong = document.createElement('strong');
            startDateStrong.textContent = 'Start Date: ';
            startDateP.appendChild(startDateStrong);
            startDateP.appendChild(document.createTextNode(startDateData));
            jobPost.appendChild(startDateP);

            // Likes
            const likesP = document.createElement('p');
            const likesStrong = document.createElement('strong');
            likesStrong.textContent = 'Likes: ';
            const likeButton = document.createElement('button');
            likeButton.className = 'like-job';
            likeButton.textContent = 'Like';
            likesP.appendChild(likesStrong);
            likesP.appendChild(likeButton);
            likesP.appendChild(document.createTextNode(` ${likesCount}`));
            jobPost.appendChild(likesP);

            // Description
            const descriptionP = document.createElement('p');
            descriptionP.textContent = job.description;
            jobPost.appendChild(descriptionP);

            
        }
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
// Likes

// document.querySelectorAll('.like-job').forEach((button) => {
//     button.addEventListener('click', () => {
//         // const jobId = button.closest('.job-post').dataset.jobId;
//         // apiCall(`job/like`, 'PUT', { id: jobId , "turnon":true})
//         //     .then(() => {
//         //         showErrorModal('Liked successfully! Refresh to see updates.');
//         //     })
//         //     .catch((error) => showErrorModal(error));
//         console.log("111");
//     });
// });

//When Page load
if(localStorage.getItem('lurkforwork_token')){
    showPage('feed');
}else{
    showPage('register');
}