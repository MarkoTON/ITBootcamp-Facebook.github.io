// Fetch user id from get parameter
var url = new URL(window.location.href);
var user_id = url.searchParams.get("id");
var user_image = document.getElementById('user-image');
var username = document.getElementById('username');
var feeds = document.getElementById('feed-list');

// Load user data
function loadUserData() {
	getUsers(true);
	getStatuses(user_id);
	getImages(user_id);
}

function displayUser() {
	user_list.forEach(function(user) {
		if(user.id == user_id) {
			if(user.image == null) {
				user_image.innerHTML = '<a href="#" class="rounded w-100 mx-auto d-block" >'
				 +
				'<img class="rounded mx-auto w-100 d-block" src="img/no-img.png" />'
		 +
				'</a>'
				;
			} else {
				user_image.innerHTML = '<a href="#" class="rounded shadow border border-info w-100 mx-auto d-block" >' + '<img class="rounded shadow border border-info w-100 mx-auto d-block" src="img/' + user.image + '" />' + '</a>';
			}
			username.innerHTML = `<h1 class="text-center mt-3 mb-4">${user.name}</h1>
			`;
		}
	});
}