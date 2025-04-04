import { BACKEND_PORT } from './config.js';
import { fileToDataUrl } from './helpers.js';

//global variables
let saveProfileHandler = null;
let myId = null;
let userCache = {};
let currentCleanup = null;

//############## USEFUL FUNCTION ##############
// Generate a link element with an avatar and username
const createUserLinkWithAvatar = (userId, additionalText = '') => {
    const listItem = document.createElement('li');
    listItem.classList.add('user-link-item');
    return getUserInfo(userId)
        .then(userInfo => {
            // have avatar: add avatar
            if (userInfo.image) {
                const img = document.createElement('img');
                img.src = userInfo.image;
                img.alt = `${userInfo.name}'s profile picture`;
                img.className = 'rounded-circle little-profile-pic';
                listItem.appendChild(img);
            } else {
                // no avatar: generate placeholder avatar
                const placeholder = document.createElement('div');
                placeholder.className = 'rounded-circle little-profile-pic placeholder-avatar';
                placeholder.textContent = userInfo.name.charAt(0).toUpperCase();
                listItem.appendChild(placeholder);
            }
            // add name and hyperlink
            const contentSpan = document.createElement('span');
            const userLink = document.createElement('a');
            userLink.href = '#';
            userLink.dataset.userId = userId;
            userLink.textContent = userInfo.name;
            userLink.addEventListener('click', (e) => {
                e.preventDefault();
                showPage('other-profile', userId);
            });
            contentSpan.appendChild(userLink);
            // append additional text behind (for comments)
            if (additionalText) {
                contentSpan.appendChild(document.createTextNode(`: ${additionalText}`));
            }
            listItem.appendChild(contentSpan);
            return listItem;
        })
        .catch(error => {
            showErrorModal(`Error loading user info for userId ${userId}: ${error}`);
            listItem.textContent = `User ID: ${userId}${additionalText ? `: ${additionalText}` : ''}`;
            return listItem;
        });
};


// show Notification (block at bottom-right)
const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => notification.remove();
    notification.appendChild(closeBtn);
    document.body.appendChild(notification);
    // disappear in 5 sec
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
};


// create "back to top btn"
const createBackToTopButton = () => {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.innerText = '↑';
    button.title = 'Back to Top';
    button.style.display = 'none';
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(button);
    return button;
};
// Initialize the "Back to Top" button
const backToTopButton = createBackToTopButton();
// Toggles the visibility of the "Back to Top" button based on scroll position and page
const toggleBackToTopButton = (pageName) => {
    const scrollTop = window.scrollY || window.pageYOffset;
    if (scrollTop > 200 && (pageName === 'feed' || pageName === 'profile')) {
        backToTopButton.style.display = 'flex'; // display
    } else {
        backToTopButton.style.display = 'none'; // hide
    }
};
// Listens for scroll events to toggle the "Back to Top" button visibility
window.addEventListener('scroll', () => {
    const currentPage = document.querySelector('.page:not(.hide)')?.id.replace('page-', '') || 'register';
    console.log(`Scroll event: currentPage=${currentPage}`);
    toggleBackToTopButton(currentPage);
});


//Displays an error modal
const showErrorModal = (message) => {
    const modalElement = document.getElementById('error-modal');
    const modal = new bootstrap.Modal(modalElement);
    document.getElementById('error-message').textContent = message;
    modalElement.setAttribute('aria-hidden', 'false');
    modal.show();
    const closeButton = modalElement.querySelector('.btn-close');
    if (closeButton) closeButton.focus();
};


//remove mask element
function removeModalBackdrop() {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
        backdrop.remove();
    });
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

// Fetches user information by ID
const getUserInfo = (userId) => {
    // If userId is in cache, directly return cached data
    if (userCache[userId]) {
        return Promise.resolve(userCache[userId]);
    }
    //else return the apiCall to gain data
    return apiCall(`user?userId=${userId}`, 'GET', {})
        .then(userData => {
            userCache[userId] = {
                name: userData.name,
                image: userData.image
            }; // cache the name and image of users
            return userCache[userId];
        })
        .catch(error => {
            console.error(`Error fetching user info for userId ${userId}:`, error);
            return {
                name: `User ID: ${userId}`,
                image: null
            };
        });
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


//############## EVENT LISTENER ##############
// listener to btn-register event
document.getElementById('btn-register').addEventListener('click', () => {
    const email = document.getElementById('register-email').value;
    const name = document.getElementById('register-name').value;
    const password = document.getElementById('register-password1').value;
    const passwordConfirm = document.getElementById('register-password2').value;
    // Validate form fields
    if (!email) {
        showErrorModal("Email cannot be empty");
        return;
    }
    if (!name) {
        showErrorModal("Name cannot be empty");
        return;
    }
    if (!password) {
        showErrorModal("Password cannot be empty");
        return;
    }
    if (!passwordConfirm) {
        showErrorModal("Password confirmation cannot be empty");
        return;
    }
    // Check if passwords match
    if (password !== passwordConfirm) {
        showErrorModal("Passwords don't match");
        return;
    }
    // Send auth/register request
    apiCall(
        'auth/register',
        'POST',
        {
            email: email,
            password: password,
            name: name,
        },
    ).then((data) => {
        localStorage.setItem('lurkforwork_token', data.token);
        myId = data.userId;
        showPage('feed');
    })
    .catch((error) => {
        showErrorModal(error);
    });
});


//listener to btn-login event
document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password1').value;
    // Validate form fields
    if (!email) {
        showErrorModal("Email cannot be empty");
        return;
    }
    if (!password) {
        showErrorModal("Password cannot be empty");
        return;
    }
    // Send auth/login request
    apiCall(
        'auth/login',
        'POST',
        {
            email: email,
            password: password,
        }
    ).then((data) => {
        localStorage.setItem('lurkforwork_token', data.token);
        myId = data.userId;
        showPage('feed');
    }).catch((error) => {
        showErrorModal(error);
    });
});

//listener to btn-profile event
document.getElementById('btn-profile').addEventListener('click', () => {
    showPage('profile');
});


//listener to btn-profileback event
document.getElementById('btn-profileback').addEventListener('click', () => {
    showPage('feed');
});

//listener to btn-logout event
document.getElementById('btn-logout').addEventListener('click', () => {
    const token = localStorage.getItem('lurkforwork_token');
    if (token) {
        localStorage.removeItem(`feedJobIds_${token}`);
    }
    localStorage.removeItem('lurkforwork_token');
    document.getElementById("btn-profile").style.display = "none";
    document.getElementById("btn-search").style.display = "none";
    showPage('register');
});

//back to feed (otherprofile)
document.getElementById('btn-other-profile-back').addEventListener('click', () => {
    showPage('feed');
});

function sendUpdateRequest(updatedData) {
    const modal = bootstrap.Modal.getInstance(document.getElementById('edit-profile-modal'));
    const editButton = document.getElementById('btn-edit-profile');
    const saveButton = document.getElementById('save-profile-changes');
    if (Object.keys(updatedData).length === 0) {
        modal.hide();
        removeModalBackdrop();
        showErrorModal('No changes to save.');
        return;
    }

    apiCall('user', 'PUT', updatedData)
        .then(() => {
            modal.hide();
            removeModalBackdrop();
            showErrorModal('Profile updated successfully! Reloading profile...');
            editButton.focus();
            loadUserProfile(myId,true);
        })
        .catch((error) => {
            modal.hide();
            removeModalBackdrop();
            showErrorModal('Failed to update: '+error);
        })
};

//show page named [pageName] and hide other
const showPage = (pageName, targetUserId = null) => {
    const pages = document.querySelectorAll('.page');

    // doing cleanup
    if (currentCleanup) {
        console.log(`Cleaning up before switching to ${pageName}`);
        currentCleanup();
    }
    for (const page of pages) {
        page.classList.add('hide');
    }
    document.getElementById(`page-${pageName}`).classList.remove('hide');


    // show back to top btn
    const scrollTop = window.scrollY || window.pageYOffset;
    toggleBackToTopButton(pageName);

    let cleanupFunc = null;
    if (pageName === 'feed') {
        cleanupFunc = loadFeed();
    }
    if (pageName === 'profile') {
        cleanupFunc = loadUserProfile(myId, true); // Load own profile
    }
    if (pageName === 'other-profile' && targetUserId) {
        cleanupFunc = loadUserProfile(targetUserId, false); // Load other user's profile
    }
    currentCleanup = cleanupFunc;
};

// show Jobs and add interact
const showJobElement = (job, index, jobsArray,targetUserId = null) => {
    const jobContainer = document.createElement('div');
    jobContainer.className = 'job-post';
    // Title
    const title = document.createElement('h1');
    title.textContent = job.title;
    jobContainer.appendChild(title);
    // Posted by
    const postedByP = document.createElement('p');
    const postedByStrong = document.createElement('strong');
    postedByStrong.textContent = 'Posted by: ';
    postedByP.appendChild(postedByStrong);
    createUserLinkWithAvatar(job.creatorId).then(userElement => {
            postedByP.appendChild(userElement);
        }).catch(error => {
            showErrorModal(`Error loading creator: ${error}`);
        });
    jobContainer.appendChild(postedByP);
    // Image
    if (job.image){
        const img = document.createElement('img');
        img.src = job.image;
        img.alt = job.title;
        jobContainer.appendChild(img);
    }
    // Posted time
    const postedTimeP = document.createElement('p');
    const postedTimeStrong = document.createElement('strong');
    postedTimeStrong.textContent = 'Posted: ';
    postedTimeP.appendChild(postedTimeStrong);
    postedTimeP.appendChild(document.createTextNode(formatTimeAgo(job.createdAt)));
    jobContainer.appendChild(postedTimeP);
    // Start Date
    const startDateP = document.createElement('p');
    const startDateStrong = document.createElement('strong');
    startDateStrong.textContent = 'Start Date: ';
    startDateP.appendChild(startDateStrong);
    startDateP.appendChild(document.createTextNode(job.start.split('T')[0].split('-').reverse().join('/')));
    jobContainer.appendChild(startDateP);
    // Likes
    const likesCount = job.likes ? job.likes.length : 0;
    const likesP = document.createElement('p');
    const likesStrong = document.createElement('strong');
    likesStrong.textContent = 'Likes: ';
    likesP.appendChild(likesStrong);
    // Like Button
    const likeButton = document.createElement('button');
    likeButton.className = 'btn-like-job';
    likeButton.dataset.jobId = job.id;
    likeButton.dataset.index = index;
    let ifLiked = job.likes && job.likes.some(like => like.userId === myId);
    likeButton.textContent = ifLiked ? 'Unlike' : 'Like';
    likeButton.addEventListener('click', () => {
        const newIfLiked = !ifLiked;
        apiCall('job/like', 'PUT', { id: job.id, turnon: newIfLiked })
            .then(() => {
                likeButton.textContent = newIfLiked ? 'Unlike' : 'Like';
                showErrorModal(`${newIfLiked ? 'Liked' : 'Unliked'} successfully!`);
            })
            .catch(error => showErrorModal('Error: ' + error));
    });
    likesP.appendChild(likeButton);
    // Likes Count Text
    likesP.appendChild(document.createTextNode(` ${likesCount} `));
    // Show Likes Button
    const showLikesButton = document.createElement('button');
    showLikesButton.textContent = 'Show Likes';
    showLikesButton.className = 'btn-show-likes';
    showLikesButton.dataset.index = index;
    showLikesButton.addEventListener('click', () => {
        const jobData = jobsArray[index];
        const likes = jobData.likes || [];
        // showModal
        removeModalBackdrop();
        const likesModal = new bootstrap.Modal(document.getElementById('likes-modal'));
        const modalBody = document.getElementById('likes-modal-body');
        modalBody.innerHTML = '';

        if (likes.length === 0) {
            const noLikesText = document.createElement('p');
            noLikesText.textContent = 'No likes yet.';
            modalBody.appendChild(noLikesText);
        } else {
            const likesList = document.createElement('ul');
            Promise.all(
                likes.map(like => createUserLinkWithAvatar(like.userId))
            ).then(likeUserElements => {
                likeUserElements.forEach(likeUserElement => {
                    likesList.appendChild(likeUserElement);
                    // add eventlistener to each username-hyperlink
                    const userLink = likeUserElement.querySelector('a');
                    if (userLink) {
                        userLink.addEventListener('click', () => {
                            likesModal.hide();
                            removeModalBackdrop();
                        });
                    }
                });
                modalBody.appendChild(likesList);
            }).catch(error => {
                showErrorModal('Error loading likes: ' + error);
                const errorText = document.createElement('p');
                errorText.textContent = 'Failed to load likes.';
                modalBody.appendChild(errorText);
            });
        }

        likesModal.show();
    });
    likesP.appendChild(showLikesButton);
    jobContainer.appendChild(likesP);
    // Description
    const descriptionP = document.createElement('p');
    const descriptionStrong = document.createElement('strong');
    descriptionStrong.textContent = 'Description: ';
    descriptionP.appendChild(descriptionStrong);
    const mydescription = document.createElement('p');
    mydescription.textContent = job.description;
    descriptionP.appendChild(mydescription);
    jobContainer.appendChild(descriptionP);
    // Comments count
    const commentsCount = job.comments ? job.comments.length : 0;
    const commentsCountP = document.createElement('p');
    const commentsCountStrong = document.createElement('strong');
    commentsCountStrong.textContent = 'Comments: ';
    commentsCountP.appendChild(commentsCountStrong);
    commentsCountP.appendChild(document.createTextNode(commentsCount));
    

    // Comment Button
    const commentButton = document.createElement('button');
    commentButton.className = 'btn-comment-job';
    commentButton.textContent = 'Comment';
    commentButton.dataset.jobId = job.id;
    commentButton.addEventListener('click', () => {
        removeModalBackdrop();
        const commentModal = new bootstrap.Modal(document.getElementById('comment-modal'));
        const commentTextArea = document.getElementById('comment-text');
        commentTextArea.value = '';
        commentModal.show();

        const submitCommentButton = document.getElementById('submit-comment-btn');
        const newSubmitButton = submitCommentButton.cloneNode(true);
        submitCommentButton.parentNode.replaceChild(newSubmitButton, submitCommentButton);
        newSubmitButton.addEventListener('click', () => {
            const commentText = commentTextArea.value;
            if (!commentText) {
                commentModal.hide();
                showErrorModal('Please enter a comment.');
                return;
            }

            const commentData = {
                id: job.id,
                comment: commentText
            };

            apiCall('job/comment', 'POST', commentData)
                .then(() => {
                    commentModal.hide();
                    removeModalBackdrop();
                    showErrorModal('Comment posted successfully!');
                })
                .catch(error => {
                    commentModal.hide();
                    showErrorModal('Error posting comment: ' + error);
                });
        });
    });
    commentsCountP.appendChild(commentButton);

    jobContainer.appendChild(commentsCountP);
    // Comments
    const commentsDiv = document.createElement('div');
    commentsDiv.className = 'comments';
    if (job.comments && job.comments.length > 0) {
        const commentsList = document.createElement('ul');
        Promise.all(
            job.comments.map(comment =>
                createUserLinkWithAvatar(comment.userId, comment.comment)
            )
        ).then(commentElements => {
            commentElements.forEach(commentElement => {
                commentsList.appendChild(commentElement);
            });
        }).catch(error => {
            showErrorModal(`Error loading comments: ${error}`);
        });
        commentsDiv.appendChild(commentsList);
    } else {
        const noCommentsP = document.createElement('p');
        noCommentsP.textContent = 'No comments yet.';
        commentsDiv.appendChild(noCommentsP);
    }
    jobContainer.appendChild(commentsDiv);

    // Delete Button (only for the creator)
    if (job.creatorId === myId) {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn-delete-job';
        deleteButton.textContent = 'Delete';
        deleteButton.dataset.jobId = job.id;
        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this job?')) {
                apiCall('job', 'DELETE', { id: job.id })
                    .then(() => {
                        showErrorModal('Job deleted successfully!');
                    })
                    .catch(error => {
                        showErrorModal('Error deleting job: ' + error);
                    });
            }
        });
        jobContainer.appendChild(deleteButton);
    }
    // Update Button (only for the creator)
    if (job.creatorId === myId) {
        const updateButton = document.createElement('button');
        updateButton.className = 'btn-update-job';
        updateButton.textContent = 'Update';
        updateButton.dataset.jobId = job.id;
        updateButton.addEventListener('click', () => {
            removeModalBackdrop();
            const updateJobModal = new bootstrap.Modal(document.getElementById('update-job-modal'));
            document.getElementById('update-job-title').value = job.title;
            document.getElementById('update-job-start-date').value = job.start.split('T')[0].split('-').reverse().join('/');
            document.getElementById('update-job-description').value = job.description;
            document.getElementById('update-job-image').value = '';
            const previewDiv = document.getElementById('update-job-image-preview');
            const previewImg = document.getElementById('update-preview-img');
            if (job.image) {
                previewImg.src = job.image;
                previewDiv.style.display = 'block';
            } else {
                previewDiv.style.display = 'none';
            }
            const imageInput = document.getElementById('update-job-image');
            imageInput.onchange = () => {
                const file = imageInput.files[0];
                if (file) {
                    fileToDataUrl(file)
                        .then((dataUrl) => {
                            previewImg.src = dataUrl;
                            previewDiv.style.display = 'block';
                        })
                        .catch((error) => {
                            showErrorModal('Error previewing image: ' + error);
                            previewDiv.style.display = 'none';
                        });
                } else {
                    previewImg.src = job.image || '';
                    previewDiv.style.display = job.image ? 'block' : 'none';
                }
            };
            updateJobModal.show();
            const saveButton = document.getElementById('btn-update-job');
            const newSaveButton = saveButton.cloneNode(true);
            saveButton.parentNode.replaceChild(newSaveButton, saveButton);
            newSaveButton.addEventListener('click', () => {
                const title = document.getElementById('update-job-title').value;
                const startDate = document.getElementById('update-job-start-date').value;
                const description = document.getElementById('update-job-description').value;
                const imageFile = document.getElementById('update-job-image').files[0];
                if (!title || !startDate || !description) {
                    updateJobModal.hide();
                    showErrorModal('Please fill in all required fields (Title, Start Date, Description).');
                    return;
                }
                const dateResult = validateDate(startDate, updateJobModal);
                if (!dateResult) return;
                const { day, month, year } = dateResult;
                const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const updatedJobData = {
                    id: job.id,
                    title,
                    start: formattedDate,
                    description,
                };
                const updateJob = () => {
                    apiCall('job', 'PUT', updatedJobData)
                        .then(() => {
                            updateJobModal.hide();
                            removeModalBackdrop();
                            showErrorModal('Job updated successfully!');
                        })
                        .catch((error) => {
                            updateJobModal.hide();
                            showErrorModal('Error updating job: ' + error);
                        });
                };
                if (imageFile) {
                    fileToDataUrl(imageFile)
                        .then((dataUrl) => {
                            updatedJobData.image = dataUrl;
                            updateJob();
                        })
                        .catch((error) => {
                            updateJobModal.hide();
                            showErrorModal('Error processing image: ' + error);
                        });
                } else {
                    updatedJobData.image = job.image || undefined;
                    updateJob();
                }
            });
        });
        jobContainer.appendChild(updateButton);
    }


    return jobContainer;
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


const loadUserProfile = (userId, isOwnProfile = false) => {
    // Determine the content container and button visibility based on whether it's the user's own profile
    const profileContent = document.getElementById(isOwnProfile ? 'profile-content' : 'other-profile-content');
    document.getElementById("btn-profile").style.display = isOwnProfile ? "none" : "block";
    document.getElementById("btn-search").style.display = "none";

    // Check if userId is valid
    if (!userId) {
        showErrorModal('User ID not found. Please log in again.');
        return;
    }

    // Clear the content
    profileContent.innerHTML = '';
    let pollingInterval = null;
    let profileJobIds = [];

    // Update jobs
    const updateJobs = (jobs, container, targetUserId) => {
        const jobsSection = container.querySelector('.jobs-section') || document.createElement('div');
        jobsSection.className = 'jobs-section';
        jobsSection.innerHTML = '';

        const jobsHeader = document.createElement('h3');
        jobsHeader.textContent = 'Created Jobs:';
        jobsSection.appendChild(jobsHeader);

        // Sort by descending order of createdAt
        const sortedJobs = jobs ? [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

        profileJobIds = [];
        if (sortedJobs && sortedJobs.length > 0) {
            sortedJobs.forEach((job, index) => {
                profileJobIds.push(job.id);
                const jobElement = showJobElement(job, index, sortedJobs, targetUserId);
                jobsSection.appendChild(jobElement);
            });
        } else {
            const noJobs = document.createElement('p');
            noJobs.textContent = 'No jobs created yet.';
            jobsSection.appendChild(noJobs);
        }

        // adding bottom-padding
        const bottomPadding = document.createElement('div');
        bottomPadding.className = 'bottom-padding';
        bottomPadding.innerText = "-------No more items-------";
        jobsSection.appendChild(bottomPadding);

        // add to container if first time load
        if (!container.contains(jobsSection)) {
            container.appendChild(jobsSection);
        }
    };

    // polling profile
    const pollProfile = () => {
        apiCall(`user?userId=${userId}`, 'GET', {})
            .then((data) => {
                updateJobs(data.jobs, profileContent, isOwnProfile ? null : userId);
            })
            .catch((error) => {
                console.error('Error polling profile:', error);
            });
    };

    // Fetch user data
    apiCall(`user?userId=${userId}`, 'GET', {}).then((data) => {
        // Create a container for avatar and text (name + email)
        const profileHeader = document.createElement('div');
        profileHeader.id = 'profile-header';

        // Profile picture
        let avatarElement;
        if (data.image) {
            avatarElement = document.createElement('img');
            avatarElement.src = data.image;
            avatarElement.alt = `${data.name}'s profile picture`;
            avatarElement.className = 'rounded-circle main-profile-pic';
            avatarElement.id = isOwnProfile ? 'profile-avatar' : 'other-profile-avatar';
        } else {
            avatarElement = document.createElement('div');
            avatarElement.className = 'rounded-circle main-profile-pic placeholder-avatar';
            avatarElement.textContent = data.name.charAt(0).toUpperCase();
            avatarElement.id = isOwnProfile ? 'profile-avatar' : 'other-profile-avatar';
        }
        profileHeader.appendChild(avatarElement);

        // Create a container for name and email (vertical layout)
        const textContainer = document.createElement('div');
        textContainer.id = 'profile-text';

        // Name
        const nameHeader = document.createElement('h2');
        nameHeader.textContent = data.name;
        nameHeader.id = isOwnProfile ? 'profile-name' : 'other-profile-name';
        textContainer.appendChild(nameHeader);

        // Email
        const emailP = document.createElement('p');
        emailP.textContent = `Email: ${data.email}`;
        emailP.id = 'profile-email';
        textContainer.appendChild(emailP);

        profileHeader.appendChild(textContainer);
        profileContent.appendChild(profileHeader);

        // If it's the user's own profile, add edit functionality
        if (isOwnProfile) {
            // Populate the edit modal values
            document.getElementById('edit-name').value = data.name;
            document.getElementById('edit-email').value = data.email;
            document.getElementById('edit-password').value = '';
            document.getElementById('edit-image').value = '';

            const editButton = document.getElementById('btn-edit-profile');
            editButton.addEventListener('click', () => {
                removeModalBackdrop();
                const modal = new bootstrap.Modal(document.getElementById('edit-profile-modal'));
                modal.show();
            });

            // Add event listener for image preview
            const imageInput = document.getElementById('edit-image');
            const previewDiv = document.getElementById('edit-image-preview');
            const previewImg = document.getElementById('preview-img');

            imageInput.addEventListener('change', () => {
                const file = imageInput.files[0];
                if (file) {
                    fileToDataUrl(file)
                        .then((dataUrl) => {
                            previewImg.src = dataUrl;
                            previewImg.className = 'rounded-circle';
                            previewImg.style.objectFit = 'cover';
                            previewDiv.style.display = 'block';
                        })
                        .catch((error) => {
                            showErrorModal('Error previewing image: ' + error);
                            previewDiv.style.display = 'none';
                        });
                } else {
                    previewDiv.style.display = 'none';
                }
            });

            // Remove old event listener for save button
            const saveButton = document.getElementById('save-profile-changes');
            if (saveProfileHandler) {
                saveButton.removeEventListener('click', saveProfileHandler);
            }

            // Create new event listener for saving profile changes
            saveProfileHandler = function () {
                const updatedData = {};
                const name = document.getElementById('edit-name').value;
                const email = document.getElementById('edit-email').value;
                const password = document.getElementById('edit-password').value;
                const imageFile = document.getElementById('edit-image').files[0];

                if (name && name !== data.name) updatedData.name = name;
                if (email && email !== data.email) updatedData.email = email;
                if (password) updatedData.password = password;
                if (imageFile) {
                    fileToDataUrl(imageFile)
                        .then((dataUrl) => {
                            updatedData.image = dataUrl;
                            sendUpdateRequest(updatedData);
                        })
                        .catch((error) => showErrorModal('Error processing image: ' + error));
                } else {
                    sendUpdateRequest(updatedData);
                }
            };
            saveButton.addEventListener('click', saveProfileHandler);
        }

        // Create a container for the "Users who watch" section
        const watchersSection = document.createElement('div');
        watchersSection.id = 'profile-watchers-section';

        // Create a container for the header (and button for other profiles)
        const watchersHeaderContainer = document.createElement('div');

        watchersHeaderContainer.id = 'profile-watchers-header';
        

        // Users who watch (header)
        const watchersHeader = document.createElement('h3');
        watchersHeader.textContent = isOwnProfile
            ? `Users who watch me (Total: ${data.usersWhoWatchMeUserIds ? data.usersWhoWatchMeUserIds.length : 0}):`
            : `Users who watch ${data.name} (Total: ${data.usersWhoWatchMeUserIds ? data.usersWhoWatchMeUserIds.length : 0}):`;
        watchersHeaderContainer.appendChild(watchersHeader);

        // Watch/Unwatch Button (only for other profiles)
        if (!isOwnProfile) {
            const watchButton = document.createElement('button');
            watchButton.id = 'other-profile-watch-btn';
            watchButton.className = 'btn btn-primary';
            const isWatching = data.usersWhoWatchMeUserIds && data.usersWhoWatchMeUserIds.includes(myId);
            watchButton.textContent = isWatching ? 'Unwatch' : 'Watch';
            watchButton.addEventListener('click', () => {
                const turnon = !isWatching;
                apiCall('user/watch', 'PUT', { id: userId, turnon })
                    .then(() => {
                        showErrorModal(`${turnon ? 'Watched' : 'Unwatched'} successfully! Reloading profile...`);
                        loadUserProfile(userId, false);
                    })
                    .catch(error => {
                        showErrorModal('Error: ' + error);
                    });
            });
            watchersHeaderContainer.appendChild(watchButton);
        }

        watchersSection.appendChild(watchersHeaderContainer);

        // Watchers list
        const watchersList = document.createElement('ul');
        if (data.usersWhoWatchMeUserIds && data.usersWhoWatchMeUserIds.length > 0) {
            Promise.all(
                data.usersWhoWatchMeUserIds.map(userId =>
                    createUserLinkWithAvatar(userId)
                )
            ).then(watcherElements => {
                watcherElements.forEach(watcherElement => {
                    watchersList.appendChild(watcherElement);
                });
            }).catch(error => {
                showErrorModal('Error loading watchers: ' + error);
            });
        } else {
            const noWatchers = document.createElement('li');
            noWatchers.textContent = isOwnProfile ? 'No users are watching you.' : 'No users are watching this user.';
            watchersList.appendChild(noWatchers);
        }
        watchersSection.appendChild(watchersList);
        profileContent.appendChild(watchersSection);
        
        // first-time load Jobs
        updateJobs(data.jobs, profileContent, isOwnProfile ? null : userId);

        // polling every 5 sec
        pollingInterval = setInterval(pollProfile, 5000);
    }).catch((error) => {
        showErrorModal(error);
    });
    const cleanup = () => {
        if (pollingInterval) {
            console.log('Stopping profile polling'); // 调试日志
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    };
    return cleanup;
};



// feed page
const loadFeed = () => {
    document.getElementById("btn-profile").style.display = "block";
    document.getElementById("btn-search").style.display = "block";

    const feedContent = document.getElementById('feed-content');
    feedContent.innerHTML = ''; // Clear existing content
    let feedJobIds = [];

    let start = 0; // current page index
    let isLoading = false;
    let hasMoreData = true;
    let lastScrollTime = 0;
    const throttleDelay = 200; // throttle delay
    let pollingInterval = null;

    // load jobs for a given startindex
    const loadJobs = (startIndex) => {
        return new Promise((resolve, reject) => {
            if (isLoading || !hasMoreData) {
                resolve(); // Resolve immediately if already loading or no more data
                return;
            }
            isLoading = true;
            apiCall(`job/feed?start=${startIndex}`, 'GET', {})
                .then((data) => {
                    const sortedJobs = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    // If no more data is returned, stop further loading and add bottom padding
                    if (sortedJobs.length === 0) {
                        hasMoreData = false;
                        isLoading = false;
                        // Add a bottom padding element
                        const bottomPadding = document.createElement('div');
                        bottomPadding.className = 'bottom-padding';
                        bottomPadding.innerText = "-------No more items-------"
                        feedContent.appendChild(bottomPadding);
                        resolve();
                        return;
                    }
                    sortedJobs.forEach((job, index) => {
                        feedJobIds.push(job.id);
                        const jobElement = showJobElement(job, index, sortedJobs);
                        feedContent.appendChild(jobElement);
                    });
                    isLoading = false;
                    start += sortedJobs.length; // Update start index for the next page
                    resolve();
                })
                .catch((error) => {
                    showErrorModal(error);
                    isLoading = false;
                    reject(error);
                });
        });
    };
    // update feed
    const updateFeed = (jobs) => {
        const sortedJobs = jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const currentJobElements = feedContent.querySelectorAll('.job-post');
        const currentJobIds = Array.from(currentJobElements).map(el => el.querySelector('.btn-like-job').dataset.jobId);

        // clear the content
        feedContent.innerHTML = '';
        feedJobIds = []; // reset jobIds
        sortedJobs.forEach((job, index) => {
            feedJobIds.push(job.id);
            const jobElement = showJobElement(job, index, sortedJobs);
            feedContent.appendChild(jobElement);
        });

        // add hint according to the hasMoreData
        const bottomPadding = document.createElement('div');
        bottomPadding.className = 'bottom-padding';
        if (hasMoreData) {
            bottomPadding.innerText = "Scroll to load more...";
        } else {
            bottomPadding.innerText = "-------No more items-------";
        }
        feedContent.appendChild(bottomPadding);
    };

    //polling
    const pollFeed = () => {
        let currentStart = 0;
        const allJobs = [];
    
        const fetchNextPage = () => {
            apiCall(`job/feed?start=${currentStart}`, 'GET', {})
                .then((data) => {
                    if (data.length > 0) {
                        allJobs.push(...data);
                        currentStart += data.length;
                        fetchNextPage();
                    } else {
                        console.log('Feed polling result:', allJobs);
    
                        const token = localStorage.getItem('lurkforwork_token');
                        if (!token) {
                            console.error('No token found, skipping feed job tracking');
                            hasMoreData = allJobs.length > 0 && currentStart > feedJobIds.length;
                            updateFeed(allJobs);
                            return;
                        }
    
                        const storageKey = `feedJobIds_${token}`;
                        const lastJobIds = [...new Set(JSON.parse(localStorage.getItem(storageKey)) || [])];
                        const currentJobIds = [...new Set(allJobs.map(job => job.id))];
    
                        console.log('Last job IDs (deduplicated):', lastJobIds);
                        console.log('Current job IDs (deduplicated):', currentJobIds);
    
                        if (!localStorage.getItem(storageKey)) {
                            localStorage.setItem(storageKey, JSON.stringify(currentJobIds));
                        } else {
                            const newJobs = [...new Set(currentJobIds.filter(id => !lastJobIds.includes(id)))];
                            console.log('New jobs detected (deduplicated):', newJobs);
                            if (newJobs.length > 0) {
                                showNotification(`New jobs posted!`);
                            }
                            localStorage.removeItem(storageKey);
                            localStorage.setItem(storageKey, JSON.stringify(currentJobIds));
                        }
    
                        hasMoreData = allJobs.length > 0 && currentStart > feedJobIds.length;
                        updateFeed(allJobs);
                    }
                })
                .catch((error) => {
                    console.error('Error polling feed:', error);
                });
        };
    
        fetchNextPage();
    };


    // Load the first page
    loadJobs(start);

    // start polling every 5 sec
    pollingInterval = setInterval(pollFeed, 5000);

    // Add scroll event listener
    window.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastScrollTime < throttleDelay) return; // Throttle the scroll event
        lastScrollTime = now;

        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || window.pageYOffset;
        const clientHeight = window.innerHeight;

        // Check if user is near the bottom of the page
        if (scrollTop + clientHeight >= scrollHeight - 250 && // threshold
            !isLoading &&
            hasMoreData
        ) {
            // Show loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.textContent = 'Loading...';
            loadingIndicator.className = 'loading-indicator';
            feedContent.appendChild(loadingIndicator);

            // Load jobs and remove loading indicator after completion
            loadJobs(start)
                .then(() => {
                    loadingIndicator.remove();
                })
                .catch(() => {
                    loadingIndicator.remove();
                });
        }
    });

    // Add event listener for Post New Job button
    const postJobButton = document.getElementById('btn-post-job');
    postJobButton.addEventListener('click', () => {
        removeModalBackdrop();
        const postJobModal = new bootstrap.Modal(document.getElementById('post-job-modal'));
        // Reset form fields when opening the modal
        document.getElementById('job-title').value = '';
        document.getElementById('job-start-date').value = '';
        document.getElementById('job-description').value = '';
        document.getElementById('job-image').value = '';
        postJobModal.show();
    });

    // stop polling when leaving the feed page
    const cleanup = () => {
        if (pollingInterval) {
            console.log('Stopping feed polling');
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
        window.removeEventListener('scroll', loadJobs); // remove scroll event listener
    };

    return cleanup;
};
const validateDate = (dateStr, modal) => {
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!datePattern.test(dateStr)) {
        modal.hide();
        showErrorModal('Start Date must be in the format DD/MM/YYYY.');
        return false;
    }

    const [day, month, year] = dateStr.split('/').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    if (
        parsedDate.getDate() !== day ||
        parsedDate.getMonth() + 1 !== month ||
        parsedDate.getFullYear() !== year
    ) {
        modal.hide();
        showErrorModal('Invalid Start Date. Please ensure the date is valid (e.g., 31/12/2024).');
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
        modal.hide();
        showErrorModal('Start Date cannot be earlier than today.');
        return false;
    }

    return { day, month, year };
};

// Post Job button event listener
document.getElementById('post-job-btn').addEventListener('click', () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById('post-job-modal'));
    const title = document.getElementById('job-title').value;
    const startDate = document.getElementById('job-start-date').value;
    const description = document.getElementById('job-description').value;
    const imageFile = document.getElementById('job-image').files[0];
    
    // Validate required fields
    if (!title || !startDate || !description) {
        modal.hide();
        showErrorModal('Please fill in all required fields (Title, Start Date, Description).');
        return;
    }
    const dateResult = validateDate(startDate, modal);
    if (!dateResult) return;
    const { day, month, year } = dateResult;
    // Format the date to YYYY-MM-DD for the API
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Prepare the job data
    const jobData = {
        title,
        start: formattedDate,
        description,
    };
    // Handle image if provided
    const postJob = () => {
        apiCall('job', 'POST', jobData)
            .then(() => {
                modal.hide();
                removeModalBackdrop();
                showErrorModal('Job posted successfully!');
                apiCall('job/feed?start=0', 'GET', {})
                    .then((feedData) => {
                        const token = localStorage.getItem('lurkforwork_token');
                        const storageKey = `feedJobIds_${token}`;
                        localStorage.setItem(storageKey, JSON.stringify(feedData.map(job => job.id)));
                        loadFeed();
                    })
                    .catch((error) => {
                        console.error('Error syncing feed jobs:', error);
                        loadFeed();
                    });
            })
            .catch((error) => {
                modal.hide();
                showErrorModal('Error posting job: ' + error);
            });
    };
    if (imageFile) {
        fileToDataUrl(imageFile)
            .then((dataUrl) => {
                jobData.image = dataUrl;
                postJob();
            })
            .catch((error) => {
                modal.hide();
                showErrorModal('Error processing image: ' + error);
            });
    } else {
        postJob();
    }
});

// Search button event listener
document.getElementById('btn-search').addEventListener('click', () => {
    removeModalBackdrop();
    const searchModal = new bootstrap.Modal(document.getElementById('search-modal'));
    searchModal.show();
});

// Watch user by email event listener
document.getElementById('search-watch-btn').addEventListener('click', () => {
    const email = document.getElementById('search-email').value;
    const modal = bootstrap.Modal.getInstance(document.getElementById('search-modal'));
    if (!email) {
        modal.hide();
        showErrorModal('Please enter a valid email address.');
        return;
    }

    apiCall('user/watch', 'PUT', { email, turnon: true })
        .then(() => {
            modal.hide();
            removeModalBackdrop();
            showErrorModal('User watched successfully!');

        })
        .catch(error => {
            modal.hide();
            showErrorModal('Error watching user: ' + error);
        });
});



for (const atag of document.querySelectorAll('a')) {
    if (atag.hasAttribute('internal-link')) {
        atag.addEventListener('click', () => {
            const pageName = atag.getAttribute('internal-link');
            showPage(pageName);
        });
    }
}
//When Page load
if (localStorage.getItem('lurkforwork_token')) {
    showPage('feed');
    const scrollTop = window.scrollY || window.pageYOffset;
    toggleBackToTopButton('feed');
} else {
    showPage('register');
    toggleBackToTopButton('register');
}