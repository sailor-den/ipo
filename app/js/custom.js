$(document).ready(function () {
	
	let user = window.navigator.userAgent;	
	document.getElementById('user').value = user;
	console.log(user)

	
	let user_ip;
	fetch('https://api.sypexgeo.net/')
		.then((data) => data.json())
		.then((data) => {
			user_ip = data.ip;
			document.getElementById('ip').value = user_ip;
			console.log(user_ip)
		});

		


});