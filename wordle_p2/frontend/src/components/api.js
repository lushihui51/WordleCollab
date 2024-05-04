// Get my username
async function api_getUsername() {
	let url='/api/username'
    try {
		const response = await fetch(url, 
			{method: 'GET', mode: 'same-origin', cache: 'no-cache', credentials: 'same-origin', redirect: 'follow', referrerPolicy: 'no-referrer'});
        if (!response.ok) throw new Error('Network error: ' + response.statusText);
        const data = await response.json();
        return data.username;
    } catch (error) {
        console.error('Error getting username: ', error);
    }
}

async function api_newgame(username){
	let url="/api/username/"+username+"/newgame";
	try {
		const response = await fetch(url,
			{method: 'PUT', mode: 'same-origin', cache: 'no-cache', credentials: 'same-origin', redirect: 'follow', referrerPolicy: 'no-referrer'});
		if (!response.ok) throw new Error('Network error: ' + response.statusText);
	} catch (error) {
		console.error('Error putting new game: ', error);
	}
}

async function api_guess(username, guess){
	if (guess === '') guess = 'A';
	let url="/api/username/"+username+"/guess/"+guess;
	try {
		const response = await fetch(url, 
			{method: 'POST', mode: 'same-origin', cache: 'no-cache', credentials: 'same-origin', redirect: 'follow', referrerPolicy: 'no-referrer'})
		if (!response.ok) throw new Error('Netword error: ' + response.statusText);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error posting new guess: ', error);
	}
}

export { api_getUsername, api_guess, api_newgame };
