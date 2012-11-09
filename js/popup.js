var PHOTOS_PER_CALL = 20;
var req;
var page = 0;
var goSearch = function(e){
	req = new XMLHttpRequest();
	var search_string = document.getElementById("search").value || "cute babies";
	search_string.replace(" ","%20");

	req.open(
		"GET",
		"http://api.flickr.com/services/rest/?" +
		"method=flickr.photos.search&" +
		"api_key=f5b96cc86e85c4224721d46bc9a56483&" +
		"text="+search_string+"&" +
		"safe_search=1&" +  // 1 is "safe"
		"content_type=1&" +  // 1 is "photos only"
		"sort=relevance&" +  // another good one is "interestingness-desc"
		"per_page="+PHOTOS_PER_CALL+"&" +
		"page="+page +"&"+
		"extras=description,views",
		true);
	req.onload = showPhotos;
	req.send(null);
}

function showPhotos() {
	var photos = req.responseXML.getElementsByTagName("photo");

	if (photos.length > PHOTOS_PER_CALL) {
		++page;
	}
	for (var i = 0, photo; photo = photos[i]; i++) {
		console.log(photo);

		var img = document.createElement("image");
		img.src = constructImageURL(photo,"s");
		img.className="pic";
		img.setAttribute("data-id",photo.getAttribute("id"));
		img.setAttribute("data-owner",photo.getAttribute("owner"));
		img.setAttribute("data-secret",photo.getAttribute("secret"));
		img.setAttribute("data-secret",photo.getAttribute("secret"));
		img.setAttribute("data-server",photo.getAttribute("server"));
		img.setAttribute("data-farm",photo.getAttribute("farm"));
		img.setAttribute("data-title",photo.getAttribute("title"));
		img.setAttribute("data-views",photo.getAttribute("views"));

		var a_link = document.createElement("a");
		a_link.href = constructImageURL(photo,"z");
		a_link.target = "_blank";
		a_link.appendChild(img);

		var title = document.createElement("div");
		title.className="title";
		title.textContent = photo.getAttribute("title");

		var frame = document.createElement("div");
		frame.id = photo.getAttribute("id");
		frame.className="frame";
		frame.appendChild(a_link);
		frame.appendChild(title);

		document.getElementById("pics").appendChild(frame);
	}
}

// See: http://www.flickr.com/services/api/misc.urls.html
function constructImageURL(photo, size) {
	return "http://farm" + photo.getAttribute("farm") +
	".static.flickr.com/" + photo.getAttribute("server") +
	"/" + photo.getAttribute("id") +
	"_" + photo.getAttribute("secret") +
	"_"+size+".jpg";
}
/*
function sort_items(items, order){
	switch (true){
		case (order=="views"):
			return items.sort(function(a,b){
				switch(true){
					case (a.views > b.views): return 1;
					case (a.views == b.views): return 0;
					case (a.views < b.views): return -1;
				}
			});
		default:
			return items;
	}
}
*/
var search_changed = function(e){
	goSearch(e);
}
var scrolled = function(e) {
	console.log(document.body.scrollTop+100, document.body.scrollHeight, document.body.scrollTop+100 >= document.body.scrollHeight);
	if (document.body.scrollTop+700 >= document.body.scrollHeight) {
		goSearch(e);
		console.log("goSearch "+page);
	}
}

window.onload = function(){
	document.getElementById("search").onchange = search_changed;
	document.onscroll = scrolled;

}
