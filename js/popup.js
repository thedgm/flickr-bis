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
		"per_page=20&" +
		"page="+page +"&"+
		"extras=description,views",
		true);
	req.onload = showPhotos;
	req.send(null);
}

function showPhotos() {
	var photos = req.responseXML.getElementsByTagName("photo");

	for (var i = 0, photo; photo = photos[i]; i++) {
		console.log(photo);

		var img = document.createElement("image");
		img.src = constructImageURL(photo,"s");

		var a_link = document.createElement("a");
		a_link.href = constructImageURL(photo,"z");
		a_link.target = "_blank";
		a_link.appendChild(img);

		var title = document.createElement("div");
		title.className="image_title";
		title.textContent = photo.getAttribute("title");

		var views = document.createElement("div");
		views.className="image_views";
		views.textContent = photo.getAttribute("views");

		var span = document.createElement("span");
		span.id = photo.getAttribute("id");
		span.appendChild(a_link);
		span.appendChild(title);
		span.appendChild(views);
		document.body.appendChild(span);
	}
	var next_btn = document.createElement("button");
	next_btn.onclick = function(){
		++page;
		document.getElementsByTagName("span");
		goSearch();
	};
	next_btn.value = "To page "+page;
	document.body.appendChild(next_btn);
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


window.onload = function(){
	document.getElementById("search").onchange = search_changed;
}
