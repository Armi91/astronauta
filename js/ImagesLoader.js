import { paths, images } from "./parts.manifest";
export class ImagesLoader {
	constructor() {
		this.clothes = [];
		this.extras = [];
		this.imageType = {
			CLOTH: 0,
			EXTRA: 1
		};

		this.loadedEvent = jQuery.Event('imagesloaded');
	}

	loadImages() {
		var counter = 0;
		var len = images.length;

		images.forEach(el => {
			let $img = $(`<img src="./assets/${el.filename}" class="carousel-img">`);

			switch (el.type) {
				case this.imageType.CLOTH:
					this.clothes[el.name] = $img;
					break;
				case this.imageType.EXTRA:
					this.extras[el.name] = $img;
					break;
				default:
					break;
			}
			counter++;
			if (counter == len) {
				this.imagesLoaded();
			}
		});
	}

	imagesLoaded() {
		console.log('all loaded');
		$(window).trigger(this.loadedEvent);
	}

	get clothesImages() {
		return this.clothes;
	}

	get extrasImages() {
		return this.extras;
	}
}