import "./popup.css";
class Tab {
    private api_key: string = "f5b96cc86e85c4224721d46bc9a56483"
    private search_in_progress: boolean = false
    private req: XMLHttpRequest
    private PHOTOS_PER_CALL: number = 20
    private page: Number = 0
    private clone: HTMLButtonElement = document.createElement("button")
    private clone_text: Text = document.createTextNode('Tab')
    private pics: HTMLDivElement = document.createElement("div")
    private bottom: HTMLDivElement = document.createElement("div")
    private search: HTMLInputElement = document.createElement("input")
    private ui_is_generated: boolean = false;
    private composePropertyValue(o:Element, i:string, d: string): string{
        return o?.getAttribute(i)?.toString() || d
    }
    private constructImageURL(photo: Element, size: string): string {
        return "https://farm" + photo.getAttribute("farm") +
            ".static.flickr.com/" + photo.getAttribute("server") +
            "/" + photo.getAttribute("id") +
            "_" + photo.getAttribute("secret") +
            "_" + size + ".jpg";
    }

    constructor() {
        this.req = new XMLHttpRequest();
        document.addEventListener('DOMContentLoaded', ()=>this.gen_ui(document.body));
    }
    gen_ui(parent: HTMLElement = document.body){
        if (this.ui_is_generated) return
        this.ui_is_generated = true

        this.clone.id = 'clone';
        this.clone.disabled = true;
        this.clone.appendChild(this.clone_text);
        this.clone.addEventListener('click', () => this.clone_tab());
        parent.appendChild(this.clone);
        this.search.id = 'search';
        this.search.className = 'search';
        this.search.addEventListener('change', () => this.goSearch());
        parent.appendChild(this.search);
        this.search.focus();
        this.pics.id = 'pics';
        parent.appendChild(this.pics);
        this.bottom.id = 'bottom_marker';
        parent.appendChild(this.bottom);

        //coming from cloned search?
        const sg = window.location.search.replace("?", "").split("=")[1];
        if (sg) {
            document.getElementById('search')?.setAttribute("value", sg)
            this.goSearch();
        }
        document.addEventListener('keydown', this.keydowned);
        document.addEventListener('scroll', this.scrolled);
    }

    clone_tab(){
        const popupUrl = "popup.html"
        const element = document.querySelector("#search") as HTMLInputElement  | null
        const search: string | undefined = element?.value
        const createProps = {
            url: search ? popupUrl + "?search=" + search : popupUrl,
            active: false
        }
        chrome.tabs.create( createProps,() => {});
    }
    private goSearch() {
        const element: HTMLElement | null = document.getElementById("search")
        let searchString: string = element?.getAttribute("value") || "cute babies";
        const params = new URLSearchParams({
            method:"flickr.photos.search",
            api_key: this.api_key,
            text:  searchString.replace(" ", "%20"),
            safe_search: "1",
            content_type: "1",
            sort: "relevance",
            per_page: this.PHOTOS_PER_CALL.toString(),
            page: this.page.toString(),
            extras: ["description","views"].toString()
        })
        const url: URL = new URL("https://api.flickr.com/services/rest?" + params)
        this.req.open("GET", url,true);
        this.req.onload = () => this.showPhotos();
        this.req.send(null);
    }
    showPhotos() {
        let searchedElement: HTMLElement | null = document.getElementById("search")
        let searched: string | null | undefined = searchedElement?.getAttribute("value")?.toString() || "cute babies"
        let photos: HTMLCollectionOf<Element> | undefined = this.req.responseXML?.getElementsByTagName("photo")
        const clone_btn:HTMLElement | null = document.getElementById('clone');
        if (photos?.length && clone_btn?.getAttribute("disabled"))
            clone_btn?.setAttribute("disabled", String(false));

        for (let photoIndex in photos) {
            let photo: Element | null = photos?.namedItem(photoIndex)
            if (!photo) continue
            let img: HTMLImageElement;
            img = document.createElement("img");
            img.src = this.constructImageURL(photo, "m");
            img.className = "pic";
            img.setAttribute("data-id", this.composePropertyValue(photo, "id", "no-id-"+photoIndex))
            img.setAttribute("data-searched", searched);
            img.setAttribute("data-owner", this.composePropertyValue(photo, "owner", "no-owner-"+photoIndex))
            img.setAttribute("data-secret", this.composePropertyValue(photo, "secret", "no-secret-"+photoIndex))
            img.setAttribute("data-server", this.composePropertyValue(photo, "server", "no-server-"+photoIndex))
            img.setAttribute("data-farm", this.composePropertyValue(photo, "farm", "no-farm-"+photoIndex))
            img.setAttribute("data-title",this.composePropertyValue(photo, "title", "no-title-"+photoIndex))
            img.setAttribute("data-views", this.composePropertyValue(photo, "views", "no-views-"+photoIndex))
            img.setAttribute("data-zurl", this.constructImageURL(photo, "z"));
            img.onclick = () => {this.download_img(img)};
            const title = document.createElement("div");
            title.className = "title";
            title.textContent = this.composePropertyValue(photo, "title", "no-title-"+photoIndex)
            let frame: HTMLDivElement = document.createElement("div");
            frame.id = this.composePropertyValue(photo, "id", "frame-id-"+photoIndex)
            frame.className = "frame";
            frame.appendChild(img);
            frame.appendChild(title);
            if (document.querySelectorAll('img').length > 0) {
                frame.classList.toggle('off');
            }
            document.getElementById("pics")?.appendChild(frame);
        }
        this.search_in_progress = false;
        if (document.querySelectorAll('img').length > 0) {
            document.getElementById('pics')?.focus();
        }
    }
    scrolled() {
        if (document.body.scrollTop + 800 >= document.body.scrollHeight) {
            if (!this.search_in_progress) {
                this.search_in_progress = true;
                this.goSearch();
            }
        }
    }
    prev_img() {
        const h = document.querySelector('.frame:not(.off)')
        const p = h?.previousElementSibling;
        if (p) {
            p.classList.remove('off');
            h.classList.add('off');
        } else {
            if (!this.search_in_progress) {
                this.search_in_progress = true;
                this.goSearch();
            }
        }
    }
    next_img() {
        const h = document.querySelector('.frame:not(.off)')
        const n = h?.nextElementSibling;
        if (n) {
            n.classList.remove('off');
            h.classList.add('off');
        } else {
            if (!this.search_in_progress) {
                this.search_in_progress = true;
                this.goSearch();
            }
        }
    }
    keydowned(e: { keyCode: any; }) {
        const k = e.keyCode;
        switch (true) {
            case (k === 37): // left -> prev
                this.prev_img();
                break;
            case (k === 39): // right -> next
                this.next_img();
                break;
            case (k === 38): // up -> new search
                this.goSearch();
                break;
            case (k === 40): // down -> clone
                document.getElementById('clone')?.click();
                break;
        }
    }

    download_img(h: HTMLImageElement){
        let url = h?.dataset?.zurl?.replace("http://", "https://");
        if (!url) return
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        const searched = h?.dataset?.searched?.split(" ").join("_")
        const filename = h?.dataset?.title?.split(" ").join("_") + ".jpg";
        xhr.responseType = 'blob';
        xhr.onload = function () {
            chrome.tabs.create({
                url: window.webkitURL.createObjectURL(this.response) + "#/" + searched + "--" + filename,
                active: false
            }, function () {
            });
        };
        xhr.send();
    }
}

new Tab()