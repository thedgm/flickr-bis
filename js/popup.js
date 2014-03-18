var PHOTOS_PER_CALL = 20;
var search_in_progress = false;
var req;
var page = -1;
var download_img = function(e){
	var url = this.dataset.zurl.replace("http://","https://");
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.searched = this.dataset.searched.split(" ").join("_");
	xhr.filename = this.dataset.title.split(" ").join("_")+".jpg";
	xhr.responseType = 'blob';
	xhr.onload = function(e) {
		chrome.tabs.create({
			url : window.webkitURL.createObjectURL(this.response)+"#/"+this.searched+"--"+this.filename,
			active : false
		},function(){});
	};
	xhr.send();
}

var goSearch = function(e){
	req = new XMLHttpRequest();
	var search_string = document.getElementById("search").value || "cute babies";

	req.open(
		"GET",
		"http://api.flickr.com/services/rest/?" +
		"method=flickr.photos.search&" +
		"api_key=f5b96cc86e85c4224721d46bc9a56483&" +
		"text="+search_string.replace(" ","%20")+"&" +
		"safe_search=1&" +  // 1 is "safe"
		"content_type=1&" +  // 1 is "photos only"
		"sort=relevance&" +  // another good one is "interestingness-desc"
		"per_page="+PHOTOS_PER_CALL+"&" +
		"page="+ (++page) +"&"+
		"extras=description,views",
		true);
	req.onload = showPhotos;
	req.send(null);
}

function showPhotos() {
	var searched = document.getElementById("search").value;
	var photos = req.responseXML.getElementsByTagName("photo");
	for (var i = 0, photo; photo = photos[i]; i++) {
		var img = document.createElement("img");
		img.src = constructImageURL(photo,"s");
		img.className="pic";
		img.setAttribute("data-id",photo.getAttribute("id"));
		img.setAttribute("data-searched",searched);
		img.setAttribute("data-owner",photo.getAttribute("owner"));
		img.setAttribute("data-secret",photo.getAttribute("secret"));
		img.setAttribute("data-server",photo.getAttribute("server"));
		img.setAttribute("data-farm",photo.getAttribute("farm"));
		img.setAttribute("data-title",photo.getAttribute("title"));
		img.setAttribute("data-views",photo.getAttribute("views"));
		img.setAttribute("data-zurl",constructImageURL(photo,"z"));
		img.onclick=download_img;
		var title = document.createElement("div");
		title.className="title";
		title.textContent = photo.getAttribute("title");
		var frame = document.createElement("div");
		frame.id = photo.getAttribute("id");
		frame.className="frame";
		frame.appendChild(img);
		frame.appendChild(title);
		document.getElementById("pics").appendChild(frame);
	}
	search_in_progress = false;
}

// See: http://www.flickr.com/services/api/misc.urls.html
function constructImageURL(photo, size) {
	return "http://farm" + photo.getAttribute("farm") +
	".static.flickr.com/" + photo.getAttribute("server") +
	"/" + photo.getAttribute("id") +
	"_" + photo.getAttribute("secret") +
	"_"+size+".jpg";
}

var search_changed = function(e){
	goSearch(e);
}

var scrolled = function(e) {
	if (document.body.scrollTop+800 >= document.body.scrollHeight) {
		if ( ! search_in_progress ){
			search_in_progress = true;
			goSearch(e);
		}
	}
}

var clone_tab = function(e){
	var text=document.getElementById("search").value;
	chrome.tabs.create({
		url: "/html/popup.html?search="+document.querySelector('#search').value,
		active: false
	}, function(tab){
		
	})

}

//window.onload = function(){
document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('#search').addEventListener('change', search_changed);
	document.querySelector('#clone').addEventListener('click', clone_tab);
	document.addEventListener('scroll', scrolled);

	//coming from cloned search?
	var sg = window.location.search.replace( "?", "" ).split("=")[1];
	if (sg){
		document.querySelector('#search').value=sg; 
		search_changed();		
	}
})
