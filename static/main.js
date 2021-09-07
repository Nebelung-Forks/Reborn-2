window.mode = localStorage.getItem('mode') || 'WEB';
window.protocol = 'https';
document.querySelector('#' + window.mode.toLowerCase() + "_title").style.textDecoration = 'underline';
document.getElementById('search').placeholder = 'Search ' + window.mode.toLowerCase();

let search = document.getElementById('search');

search.focus();

search.onblur = function () {
    setTimeout(function () {
        search.focus();
    });
};

[...document.querySelectorAll('.mode')].forEach(elem => {
	elem.addEventListener('click', event => {
		let node;

		if (event.target.childNodes.length > 1) {
			node = event.target.childNodes[1];
		} else {
			node = event.target;
		}

        window.mode = node.innerText;

		[...document.querySelectorAll('.mode_title')].forEach(elem => {
			elem.style.textDecoration = 'none';
		});
		node.style.textDecoration = 'underline';

		localStorage.setItem('mode', window.mode);
		document.getElementById('search').placeholder = 'Search ' + window.mode.toLowerCase();
	});
});

document.getElementById('search').onkeypress = e => {
    	if (!e) e = window.event;
    	var keyCode = e.code || e.key;
    	if (keyCode == 'Enter'){
    		searchFunctions[window.mode](document.getElementById('search').value);
	}
}

function getUrl(str) {
	return encodeURIComponent(str.toString().split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join(''));
}

const searchFunctions = {
    'WEB': q => {
        if (q.includes("http://") || q.includes("https://")) {
			var redir = window.protocol + '://' + window.location.host + '/fetch/' + getUrl(q);
		} else {
			var redir = window.protocol + '://' + window.location.host + '/fetch/' + getUrl('https://gg.fm/search?q=' + q);
		}

        window.open(redir);
    },
    'MUSIC': q => {
        var redir = window.protocol + '://' + window.location.host + '/slider/#' + q;
		window.open(redir);
    },
    'VIDEO': q=> {
        var redir = window.protocol + '://' + window.location.host + '/fetch/' + getUrl('https://www.youtube.com/results?search_query=' + q);
        window.open(redir);
    },
    'MOVIE': q=> {
        var redir = window.protocol + '://' + window.location.host + '/fetch/' + getUrl('https://lookmovie.io/movies/search/?q=' + q);
        window.open(redir);
    }
}

const setCookie = (name, value, daysToLive) => {
    	let cookie = name + "=" + encodeURIComponent(value);
    	if (typeof daysToLive === "number")
        cookie += "; max-age=" + (daysToLive*60*60*24) + ";domain=." + document.domain;
	document.cookie = cookie;
}

if (document.cookie.indexOf("notabot=") < 0) setCookie("notabot", "not", 5);
