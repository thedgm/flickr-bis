;
(() => {
    let showPhotos = function () {
        let searched = document.getElementById("search").value, photos = req.responseXML.getElementsByTagName("photo"),
            clone_btn = document.getElementById('clone');
        if (photos.length > 0 && clone_btn.disabled)
            clone_btn.disabled = false;
        for (var i = 0, photo; photo = photos[i]; i++) {
            var img = document.createElement("img");
            img.src = constructImageURL(photo, "m");
            img.className = "pic";
            img.setAttribute("data-id", photo.getAttribute("id"));
            img.setAttribute("data-searched", searched);
            img.setAttribute("data-owner", photo.getAttribute("owner"));
            img.setAttribute("data-secret", photo.getAttribute("secret"));
            img.setAttribute("data-server", photo.getAttribute("server"));
            img.setAttribute("data-farm", photo.getAttribute("farm"));
            img.setAttribute("data-title", photo.getAttribute("title"));
            img.setAttribute("data-views", photo.getAttribute("views"));
            img.setAttribute("data-zurl", constructImageURL(photo, "z"));
            img.onclick = download_img;
            var title = document.createElement("div");
            title.className = "title";
            title.textContent = photo.getAttribute("title");
            var frame = document.createElement("div");
            frame.id = photo.getAttribute("id");
            frame.className = "frame";
            frame.appendChild(img);
            frame.appendChild(title);
            if (document.querySelectorAll('img').length > 0) {
                frame.classList.toggle('off');
            }
            document.getElementById("pics").appendChild(frame);
        }
        search_in_progress = false;
        if (document.querySelectorAll('img').length > 0) {
            document.getElementById('pics').focus();
        }
    };
    let constructImageURL = function (photo, size) {
        return "http://farm" + photo.getAttribute("farm") +
            ".static.flickr.com/" + photo.getAttribute("server") +
            "/" + photo.getAttribute("id") +
            "_" + photo.getAttribute("secret") +
            "_" + size + ".jpg";
    };
    let PHOTOS_PER_CALL = 20, search_in_progress = false, req, page = -1
        , download_img = function (e) {
        let url = this.dataset.zurl.replace("http://", "https://");
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.searched = this.dataset.searched.split(" ").join("_");
        xhr.filename = this.dataset.title.split(" ").join("_") + ".jpg";
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
            chrome.tabs.create({
                url: window.webkitURL.createObjectURL(this.response) + "#/" + this.searched + "--" + this.filename,
                active: false
            }, function () {
            });
        };
        xhr.send();
    }, goSearch = () => {
        req = new XMLHttpRequest();
        const search_string = document.getElementById("search").value || "cute babies";
        req.open("GET", "https://api.flickr.com/services/rest/?" +
            "method=flickr.photos.search&" +
            "api_key=f5b96cc86e85c4224721d46bc9a56483&" +
            "text=" + search_string.replace(" ", "%20") + "&" +
            "safe_search=1&" + // 1 is "safe"
            "content_type=1&" + // 1 is "photos only"
            "sort=relevance&" + // another good one is "interestingness-desc"
            "per_page=" + PHOTOS_PER_CALL + "&" +
            "page=" + (++page) + "&" +
            "extras=description,views", true);
        req.onload = showPhotos;
        req.send(null);
    }, scrolled = () => {
        if (document.body.scrollTop + 800 >= document.body.scrollHeight) {
            if (!search_in_progress) {
                search_in_progress = true;
                goSearch();
            }
        }
    }, prev_img = () => {
        const h = document.querySelector('.frame:not(.off)'), p = h.previousElementSibling;
        if (p) {
            p.classList.remove('off');
            h.classList.add('off');
        } else {
            if (!search_in_progress) {
                search_in_progress = true;
                goSearch();
            }
        }
    }, next_img = () => {
        const h = document.querySelector('.frame:not(.off)'), n = h.nextElementSibling;
        if (n) {
            n.classList.remove('off');
            h.classList.add('off');
        } else {
            if (!search_in_progress) {
                search_in_progress = true;
                goSearch();
            }
        }
    }, keydowned = function (e) {
        const k = e.keyCode;
        switch (true) {
            case (k === 37): // left -> prev
                prev_img();
                break;
            case (k === 39): // right -> next
                next_img();
                break;
            case (k === 38): // up -> new search
                goSearch();
                break;
            case (k === 40): // down -> clone
                document.getElementById('clone').click();
                break;
        }
    }, clone_tab = () => {
        chrome.tabs.create({
            url: "/html/popup.html?search=" + document.querySelector('#search').value,
            active: false
        }, () => {});
    }, attach_events = () => {
        //coming from cloned search?
        const sg = window.location.search.replace("?", "").split("=")[1];
        if (sg) {
            document.getElementById('search').value = sg;
            goSearch();
        }
        document.addEventListener('keydown', keydowned);
        document.addEventListener('scroll', scrolled);
    }, gen_ui = () => {
        const body = document.body, clone = document.createElement("button"),
            clone_text = document.createTextNode('Tab'),
            search = document.createElement("input"), pics = document.createElement("div"),
            bottom = document.createElement("div");
        clone.id = 'clone';
        clone.disabled = true;
        clone.appendChild(clone_text);
        clone.addEventListener('click', clone_tab);
        search.id = 'search';
        search.className = 'search';
        search.addEventListener('change', goSearch);
        pics.id = 'pics';
        bottom.id = 'bottom_marker';
        body.appendChild(clone);
        body.appendChild(search);
        search.focus();
        body.appendChild(pics);
        body.appendChild(bottom);
        attach_events()
    };
    document.addEventListener('DOMContentLoaded', gen_ui);
})();
