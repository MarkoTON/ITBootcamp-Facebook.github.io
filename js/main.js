/**
* JS code for handling frontend actions
*
*/

function getUserProfile() {
	var user_profile = {};
	var user_image_div = document.getElementById('user-image');
	var username_div = document.getElementById('username');
	var http = new XMLHttpRequest();
	http.open('GET', 'php/get_users.php', true);
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var data = JSON.parse(http.responseText);
			if(data.data != '') {
				data.data.forEach(function(user_data) {
					if(user_data.id == user_id){              
						user_profile = user_data;
					}
				});                
				if(user_profile.image != null) {
					user_image_div.innerHTML = 
					'<img class="rounded shadow border border-info d-block w-100" src="img/'+user_profile.image+'" />'
					;
				} else {
					user_image_div.innerHTML = '<img class="rounded shadow border border-info w-100 d-block" src="img/no-img.png" />';
				}
				username_div.innerHTML = `<h1 class="text-center mt-3 mb-4">${user_profile.username}</h1>`;
			}
		}
	}
	http.send(null);
}

function getStatuses(statuses_for_user = null) {
	var http = new XMLHttpRequest();
	http.open('GET', 'php/get_statuses.php', true);
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var data = JSON.parse(http.responseText);
			if(data.data != '') {
				data.data.forEach(function(status) {
					var item = {
						id: status.id,
						type: 'status',
						// datetime: status.created_at.replace("_", " "),
						datetime: status.created_at.split('_').join(' '),
						author: status.user_id,
						// content: status.status.replace("_", " "),
						content: status.status.split('_').join(' '),
						timestamp: status.timestamp,
						private: false
					}
					if(statuses_for_user != null) {
						if(status.user_id == statuses_for_user) {                            
							feed_list.push(item);
						}
					} else {
						feed_list.push(item);
					}
					
				});
				status_loaded = true;
				sortFeeds();
			}
		}
	}
	http.send(null);
}

function getImages(statuses_for_user = null) {
	var http = new XMLHttpRequest();
	http.open('GET', 'php/get_images.php', true);
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var data = JSON.parse(http.responseText);
			if(data.data != '') {
				data.data.forEach(function(image) {
					var item = {
						id: image.id,
						type: 'image',
						// datetime: image.date_uploaded.replace("_", " "),
						datetime: image.date_uploaded.split('_').join(' '),
						author: image.user_id,
						content: image.name,
						timestamp: image.timestamp,
						private: image.private
					}
					
					if(statuses_for_user != null) {
						if(image.user_id == statuses_for_user && image.private != true) {                            
							feed_list.push(item);
						}
					} else {
						feed_list.push(item);
					}
				});                
				image_loaded = true;
				sortFeeds();
			}
		}
	}
	http.send(null);
}

// Gat User info
function getUsers(get_user = false) {
	user_list = [];
	var http = new XMLHttpRequest();
	http.open('GET', 'php/get_users.php', true);
	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var data = JSON.parse(http.responseText);
			if(data.data != '') {
				data.data.forEach(function(user) {
					var item = {
						id: user.id,
						name: user.first_name + ' ' + user.last_name,
						image: user.image
					}
					user_list.push(item);
				});
				users_loaded = true;
				if(get_user) {
					displayUser();
				} else {
					sortFeeds();    
				}
			}
		}
	}
	http.send(null);
}

// Loading/Calling functions
function loadData() {
	getStatuses();
	getImages();
	getUsers();
	getUserProfile();
}

// Display Status (comment or image)
function displayFeeds() {
	status_div.innerHTML = '';
	feed_list.forEach(function(feed) {
		if(feed.private && feed.author != user_id) {
			console.log(feed);
		} else {
			// Enter some TEXT
			var feed_content = '<div class="feed-content card">';        
			user_list.forEach(function(user) {
				if(user.id == feed.author) {
					feed_content += '<div class="feed-author card-header"><a href="users.html?id=' + user.id + '">';
					if(user.image == null){
						feed_content += '<img class="rounded mr-3" src="img/no-img.png" />';
					} else {
						feed_content += '<img class="rounded mr-3" src="img/' + user.image + '" />';
					}
					feed_content += '</a>' +
					'<div class="card-title d-inline" >' +
					'<p class="d-inline-block">' + user.name + '</p>' + '<p class="d-inline-block float-right pt-2">' + feed.datetime + '</p> '+ 
					'</div>' +
					'</div>';
				}
			});
			// Enter some IMAGE
			feed_content += '<div class="feed-body card-body w-100">';
			if(feed.type == 'image') {
				feed_content += '<a href="image.html?id=' + feed.id + '"><img src="img/' + feed.content + '" class="w-100" /></a>';
			} else {
				feed_content += '<p class="feed-status">' + feed.content + '</p>';
			}
			feed_content += '<p class="created">'  + '</p></div></div>';
			status_div.innerHTML += feed_content;
		}
	});
}

// Chack for data Status
function addStatus() {
	var valid = true;
	var status_content = document.getElementById("status").value;
	if(status_content.length > 140) {
		errors.innerHTML += '<div class="error-msg">Status must contain maximum 140 characters.</div>';
		valid = false;
	}
	if(valid) {
		var status = {
			id: makeid(),
			user_id: user_id,
			status: status_content,
			created_at: getDateTime(),
			timestamp: getTimestamp()
		}
		
		// Reset error messages
		errors.innerHTML = '';
		success.innerHTML = '';
		
		var http = new XMLHttpRequest();
		http.open('POST', 'php/add_status.php', true);
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		
		// Listener for waiting backend actions
		http.onreadystatechange = function() {
			if(http.readyState == 4 && http.status == 200) {
				// Converting JSON to JS object
				var data = JSON.parse(http.responseText);
				if(data.success != '') {
					success.innerHTML = '<div class="success-msg">New status created.</div>';
					setTimeout(refreshPage, 1000);
				}
			}
		}
		var data = JSON.stringify(status);
		http.send(data);
	}
}

// Add image on some Post
function addImage() {
	var image = document.getElementById('image').files[0];
	var checkbox = document.getElementById('private');
	var private = false;
	if(checkbox.checked == true) {
		private = true;
	}
	if(image != undefined) {
		var url = 'php/upload.php?user_id=' + user_id + '&private=' + private + '&timestamp=' + getTimestamp();
		
		var formData = new FormData();
		formData.append('image', image);
		
		fetch(url, {
			method: 'POST',
			body: formData
		}).then(response => {
			errors.innerHTML = '';
			success.innerHTML = '';
			
			if(response.status == 200) {
				success.innerHTML = '<div class="success-msg">New image created.</div>';
				setTimeout(refreshPage, 1000);
			} else {
				errors.innerHTML = '<div class="error-msg">Error during upload image.</div>';
			}
		});
	} else {
		errors.innerHTML = '<div class="error-msg">Please choose image.</div>';
		setTimeout(() =>{errors.innerHTML = ""} , 2000);
	}
}

// Add a profile Image
function changeProfileImage() {
	errors.innerHTML = '';
	success.innerHTML = '';
	var profile_image = document.getElementById('profile-image').files[0];
	if(profile_image != undefined) {
		var url = 'php/profile_image_upload.php?user_id=' + user_id;
		
		var formData = new FormData();
		formData.append('image', profile_image);
		
		fetch(url, {
			method: 'POST',
			body: formData
		}).then(response => {            
			if(response.status == 200) {
				success.innerHTML = '<div class="success-msg">User profile image updated.</div>';
				setTimeout(refreshPage, 1000);
			} else {
				errors.innerHTML = '<div class="error-msg">Error during upload image.</div>';
			}
		});
	} else {
		errors.innerHTML = '<div class="error-msg">Plase select image.</div>';
		setTimeout(() =>{errors.innerHTML = ""} , 2000);
	}
}