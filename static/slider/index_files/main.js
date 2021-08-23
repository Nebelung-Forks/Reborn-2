const defaultVolume = 75;

$(document).ready(function(){
	$(".mainBackground").flexBackground({birds:'10',
		size:'15',
		interval : '30',
		velocity : '3',
		color : 'rgb(0, 0, 0, .5)'
		});

	// $(".mainBackground").flexBackground({numberOfPoints:'400',
	// 	radius:'2',
	// 	interval : '30',
	// 	velocity : '2',
	// 	color : 'rgb(256, 256, 256)' //Only In RGB format. don't use #hex or any other color format
	// 	});

	if (location.hash){
		var query = decodeURIComponent(window.location.hash.substr(1));
		$('.buttonQuery').val(query);
		vkSearch(query, 1);
	}

	$('.buttonQuery').keypress(function (e) {
		var key = e.which;
		if(key == 13)
		{
			var query = $('.buttonQuery').val();
			if (query) vkSearch(query, 1);
		}
	});

	$("#informer").click(function() {
		$(this).hide();
	});


	$("#searchButton").click(function() {
		var query = $('.buttonQuery').val();
		if (query) vkSearch(query, 1);
	});

	soundManager.setup({url: 'https://slider.kz/media/swf/'});
	
	$("#r_bash").click(function() {
		getBash();
	});
	getBash();
})

function getBash(){
	$.get( "https://slider.kz/modules/bash/", function( data ) {
		$("#r_bash").hide().html(data).fadeIn("fast");
	});
}

function volumizer(){

	let vol = localStorage.getItem("volume") || defaultVolume;
	soundManager.defaultOptions.volume = vol

	 $("#setVol").slider({
		range: "max",
		min: 0,
		max: 100,
		value: vol, 
		animate: true,
		slide: function(event, ui) {
			soundManager.setVolume(ui.value);
			localStorage.setItem("volume", ui.value);
			soundManager.defaultOptions.volume = ui.value;
		}
	});
}


function vkSearch(query, page) {

	// $('#pagination').twbsPagination({
	// 	startPage: page,
	// 	totalPages: 23,
	// 	visiblePages: 10,
	// 	initiateStartPageClick: false,
	// 	onPageClick: function (evt, page) {
	// 		var query = $('.buttonQuery').val();
	// 		vkSearch(query, page);
	// 	}
	// });

	let seType = 'q';

	if (query == "!top"){
		seType = 'top';
	}

	location.hash = query;
	$(document).attr("title", "Download: " + query);
	$('#liveaudio').html('<center><img src="https://slider.kz/media/images/preload.gif"></center>').show();


	$.getJSON("/kz/vk_auth.php?" + seType + "=" + encodeURIComponent(query), function( data, keys) {
		var items = [];
		$.each( data['audios'], function( uid, d ) {
			if (d && d.length > 1){
				console.log(d.length);
				$.each( d, function( key, track ) {
					var flag = (key % 2 != 0 ? 'stripe-even' : 'stripe-odd');
						items.push('<div class="num">'+key+'.</div>' +
						'<div class="track '+flag+'">' +
							'<div class="ui360">' +
							//window.location.protocol+'//'+window.location.host.substr(window.location.host.indexOf(".") + 1)
								//'<a href="'+proxied+'">'+track['tit_art']+'</a>' +
								'<a href="/kz/download/' + track['id'] + "/" + track['duration']+ "/" + track['url'] + "/" + encodeURIComponent(track['tit_art']) + '.mp3?extra=' + track['extra']+ '">'+ track['tit_art']+'</a>' +
								//'<a href="/download/' + uid + "/" +track['id']+  "/" + track['ext'] + '.mp3">'+ track['tit_art']+'</a>' +
							'</div>' +
							'<div class="controlPanel">' +
								'<div class="trackTime" onclick="get_btrate(\'' +track['id'] +  "/" + track['duration']+ "/" + track['url'] + '.mp3?extra=' + track['extra']+ '\')">'+toHHMMSS(track['duration'])+'</div>' +
								'<div class="trackDownload">' +'<a href="/kz/download/' +track['id'] +  "/" + track['duration']+ "/" + track['url'] + "/" + encodeURIComponent(track['tit_art']) + '.mp3?extra=' + track['extra']+ '"><img alt="download" src="https://slider.kz/media/images/download.gif"></a>' +'</div>' +
								//'<div class="trackDownload">' +'<a href="/download/' + uid + "/" + track['id'] + "/" + track['ext'] + '.mp3"><img alt="download" src="/media/images/download.gif"></a>' +'</div>' +
							'</div>' +
						'</div>');
				})
				$('#liveaudio').html(items);
				soundManager.reboot();
				volumizer();
			} else {
				$('#liveaudio').html("something went wrong..").show();
			}
		})
	})
}

function toHHMMSS(secs)
{
	var t = new Date(1970,0,1);
	t.setSeconds(secs);
	var s = t.toTimeString().substr(0,8);
	if(secs > 86399) s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
	if(s.substr(0, 2) == 00) return s.substr(3);
	return s;
}

function get_btrate(id,)
{
	$('#informer').show().html('<img src="https://slider.kz/media/images/preload.gif">');
	$.get('/info/'+id, function(data){$('#informer').html(data)});
}


function hideDisc()
{
	localStorage.setItem("disclamer3", 1);
	$('#fullwrapper').animate({ opacity: "hide" }, "slow");
}
