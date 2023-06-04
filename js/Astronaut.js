import { ImagesLoader } from "./ImagesLoader";
import { images } from "./parts.manifest";
import { svgs } from "./svgs";
import { texts } from './texts';

export class Astronaut {
	constructor() {
		this.clothes = [];
		this.extras = [];
		this.activeClothes = 0;
		this.activeExtras = 0;
		this.$clothesContainer = $('#carousel-clothes');
		this.$extrasContainer = $('#carousel-extras');
		this.$mainArea = $('#astronaut');
		this.$items = null;
		this.imagesArr = [];
		this.svgArr = [];
		this.latestItemInfoClothes = undefined;
		this.latestItemInfoExtras = undefined;
		this.gender = undefined;
		this.gameStarted = false;

		this.astronaut = { // 0: brak, 1: jest ale złe, 2: OK
			helmet: 0,
			back: 0,
			torso: 0,
			trousers: 0,
			boots: 0,
			gloves: 0

		};

		this.parts = svgs;

		this.elementsToWear = 10;

		this.prepareImages();

		this.buildAstronaut();

		this.createStructure(this.parts);
		this.initCarousels();

		this.addListeners();

		this.$clothesContainer.on('prepared.owl.carousel', e => {});

		this.animateText(texts[0]);
	}

	createStructure(elements) {
		for (let i in elements.addon) {
			let $div = $(`<div class="oc-item"></div>`);
			$div[0].dataset.placeholder = elements.addon[i].placeholder;
			let svg = $(`<svg viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;">
			${elements.addon[i].code}
			</svg>`);

			$div.append(svg);
			$div[0].dataset.id = $div.find('g').attr('id');
			$div[0].dataset.name = i;
			$div[0].dataset.type = 'addon';

			this.$extrasContainer.append($div);
			this.extras[i] = $div;
		}

		for (let i in elements.suit) {
			let $div = $(`<div class="oc-item"></div>`);
			$div[0].dataset.placeholder = elements.suit[i].placeholder;
			let svg = `<svg viewBox="0 0 512 512" >${elements.suit[i].code}</svg>`;
			let $svg = $(svg);
			$div.append($svg);
			let id = $div.find('g').attr('id');
			$div[0].dataset.id = id;
			$div[0].dataset.name = i;
			$div.find('g').removeAttr('id');
			$div[0].dataset.type = 'suit';
			this.$clothesContainer.append($div);
			this.clothes[i] = $div;

			let svgBBox = $(`#${id}`)[0].getBBox();
			let gBBox = $(`#${id}`).find('g')[0].getBBox();
			let scaleX = svgBBox.width / gBBox.width;
			let scaleY = svgBBox.height / gBBox.height;

			let x = svgBBox.x - gBBox.x;
			let y = svgBBox.y - gBBox.y;
			$svg.attr('viewBox', `${Math.ceil(Math.abs(gBBox.x) / scaleX)} ${Math.ceil(Math.abs(gBBox.y) / scaleY)} ${Math.ceil((gBBox.x + gBBox.width) / scaleX)} ${Math.ceil((gBBox.y + gBBox.height) / scaleY)}`);
			$svg.css('width', 'auto');
		}
	}

	initCarousels() {
		let carouselOptions = {
			items: 1,
			loop: false,
			rewind: true,
			nav: true,
			navText: ['<img class="arrow-prev" src="assets/arrow.png">', '<img class="arrow-next" src="assets/arrow.png">'],
			margin: this.$clothesContainer.width()
		};

		this.$clothesContainer.on('initialized.owl.carousel', e => {
			this.activeClothes = e.item.index;
			this.clothesCount = e.item.count;
			this.activeClothesName = $('#carousel-clothes .owl-item.active')[0].children[0].dataset.id;
			this.latestItemInfoClothes = e.item;
		});

		this.$extrasContainer.on('initialized.owl.carousel', e => {
			this.activeExtras = e.item.index;
			this.extrasCount = e.item.count;
			this.activeExtrasName = $('#carousel-extras .owl-item.active')[0].children[0].dataset.id;
			this.latestItemInfoExtras = e.item;
		});

		this.$clothesContainer.owlCarousel(carouselOptions);
		this.$extrasContainer.owlCarousel(carouselOptions);
	}

	addListeners() {

		this.$clothesContainer.on('translated.owl.carousel', e => {
			this.activeClothes = e.item.index;
			this.clothesCount = e.item.count;
			this.activeClothesName = $('#carousel-clothes .owl-item.active')[0].children[0].dataset.id;
			this.latestItemInfoClothes = e.item;
		});

		this.$extrasContainer.on('translated.owl.carousel', e => {
			this.activeExtras = e.item.index;
			this.extrasCount = e.item.count;
			this.activeExtrasName = $('#carousel-extras .owl-item.active')[0].children[0].dataset.id;
			this.latestItemInfoExtras = e.item;
		});

		$('.medium-area').on('click', '.gender', e => {
			this.switchGender(e.currentTarget.dataset.gender);
		});

		$('#dress-up-button__clothes').on('click', this.onSelect.bind(this, 'suit'));
		$('#dress-up-button__extras').on('click', this.onSelect.bind(this, 'addon'));

		$('#buttons').on('click', '#reset', this.reset.bind(this));
		$('#buttons').on('click', '#exit', this.exit.bind(this));

		$('#text').on('click', this.animateText.bind(this, texts[0]));
	}

	onSelect(type) {
		if (type == 'suit') {
			this.$clothesContainer.trigger('remove.owl.carousel', [this.activeClothes]);
			if (this.activeClothes == this.clothesCount - 1) {
				this.$clothesContainer.trigger('prev.owl.carousel', [200]);
			}

			this.placeInMainArea(type, this.activeClothesName);
			this.$clothesContainer.trigger('refresh.owl.carousel');
			this.activeClothesName = $('#carousel-clothes .owl-item.active')[0].children[0].dataset.id;
		}

		if (type == 'addon') {
			this.$extrasContainer.trigger('remove.owl.carousel', [this.activeExtras]);
			if (this.activeExtras == this.extrasCount - 1) {
				this.$extrasContainer.trigger('prev.owl.carousel', [200]);
			}

			this.placeInMainArea(type, this.activeExtrasName);
			this.$extrasContainer.trigger('refresh.owl.carousel');
			this.activeExtrasName = $('#carousel-extras .owl-item.active')[0].children[0].dataset.id;
		}
	}

	placeInMainArea(type, item) {
		var elem = $(`#${item}`);
		var placeholder = elem.data('placeholder');
		var a = $('.astronaut-full').find(`[data-placeholder='${placeholder}']`);
		this.backToCarousel(a);

		let state = this.parts[type][elem.data('name')].correct;
		this.astronaut[placeholder] = state ? 2 : 1;

		$(`#${placeholder} span`).text(this.astronaut[placeholder]);

		var gs = $('.astronaut-full svg').children();

		switch (item) {
			case 'Addon-backpack':
				if (gs[0].id != item) {
					$(`#${item}`).removeClass('hidden').detach().insertBefore(gs[0]);
				} else {
					$(`#${item}`).removeClass('hidden');
				}
				break;
			case 'Astrosuit-jacket':
				$(`#${item}`).removeClass('hidden').detach().insertBefore("#GIRL-Body-hair");
				break;
			case 'Astrosuit-helmet':
				$(`#${item}`).removeClass('hidden');
				break;

			default:
				$(`#${item}`).removeClass('hidden');
				break;
		}

		this.checkHair();
		this.checkDone();
	}

	checkHair() {
		if (!$('#Astrosuit-helmet').hasClass('hidden')) {
			$('#GIRL-Body-hair, #BOY-hair').addClass('hidden');
		} else {
			if (this.gender == 'male') {
				$('#BOY-hair').removeClass('hidden');
			} else if (this.gender == 'female') {
				$('#GIRL-Body-hair').removeClass('hidden');
			}
		}
	}

	backToCarousel(items) {
		let activeItem = items.not('.hidden');
		if (activeItem.length) {
			let type = activeItem.data('type');
			if (type == 'suit') {
				this.$clothesContainer.trigger('add.owl.carousel', [this.clothes[activeItem.data('name')]]);
			}
			if (type == 'addon') {
				this.$extrasContainer.trigger('add.owl.carousel', [this.extras[activeItem.data('name')]]);
			}
		}
		items.addClass('hidden');
	}

	switchGender(gender) {
		this.gameStarted = true;
		if (gender == 'male') {
			$('[data-gender="female"]').addClass('hidden');
			$('[data-gender="male"]').removeClass('hidden');
		} else if (gender == 'female') {
			$('[data-gender="male"]').addClass('hidden');
			$('[data-gender="female"]').removeClass('hidden');
		}

		$('.small-area-field').removeClass('hidden');

		this.gender = gender;
		this.startGame();
	}

	startGame() {
		$('.gender, #text').addClass('hidden');
		$('.medium-area__game, .astronaut-full').removeClass('hidden');
	}

	prepareImages() {
		images.forEach(elem => {
			this.imagesArr[elem.name] = elem;
		});

		for (let i in svgs) {
			for (let j in svgs[i]) {
				svgs[i][j].type = i;
				this.svgArr[j] = svgs[i][j];
			}
		}

		this.svgArr.sort((a, b) => {
			if (a.z < b.z) return -1;
			if (a.z > b.z) return 1;
			return 0;
		});

		this.svgArr.forEach((el, ind) => {
			console.log(el);
		});
	}

	buildAstronaut() {
		var svg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="844px"
		height="977px" viewBox="0 0 844 977" enable-background="new 0 0 844 977" xml:space="preserve">`;

		for (let i in this.parts) {
			for (let j in this.parts[i]) {
				let g = this.parts[i][j].code;
				let data = ` class="${i == 'addon' || i == 'suit' ? 'item' : 'body'}" 
					data-placeholder="${this.parts[i][j].placeholder}" 
					data-name="${j}" 
					data-type="${i}" `;
				let gDone = g.slice(0, 2) + data + g.slice(2);
				svg += gDone;
			}
		}

		svg += `</svg>`;

		let $svgDOM = $(svg);
		$('.astronaut-full').append($svgDOM);

		$('.item').addClass('hidden');

		this.allItems = $('.astronaut-full .item');
	}

	reset() {

		for (let i = 0; i < this.latestItemInfoClothes.count - 1; i++) {
			this.$clothesContainer.trigger('remove.owl.carousel', [i]);
		}

		this.$clothesContainer.trigger('destroy.owl.carousel');
		this.$clothesContainer.empty();

		for (let i = 0; i < this.latestItemInfoExtras.count - 1; i++) {
			this.$extrasContainer.trigger('remove.owl.carousel', [i]);
		}

		this.$extrasContainer.trigger('destroy.owl.carousel');
		this.$extrasContainer.empty();

		this.createStructure(this.parts);
		this.initCarousels();
		this.allItems.addClass('hidden');
		this.checkHair();
	}

	exit() {
		$('.gender, #text').removeClass('hidden');
		$('.medium-area__game, .astronaut-full, .small-area-field').addClass('hidden');
		this.reset();
		this.gameStarted = false;
		this.isFlashing = false;
		this.animateText(texts[0]);
	}

	animateText(textStr) {
		var text = $('#text .text-span');
		var textArr = textStr.split('');

		var textToAdd = '';

		var i = 0;
		var scope = this;

		var delay = 60;

		const flashUnderscore = () => {
			scope.isFlashing = true;
			setTimeout(function () {
				text.toggleClass('with-after');
				if (!scope.gameStarted && scope.isFlashing) {
					flashUnderscore();
				}
			}, 500);
		};

		const showLetter = () => {
			setTimeout(function () {

				textToAdd += textArr[i];

				if (textArr[i + 1] && textArr[i + 1] == '^') {
					delay = 600;
				} else {
					delay = 60;
				}

				if (textArr[i] == '*') {
					text.append('<br>');
				} else if (textArr[i] == '[') {
					text.append('<strong>');
				} else if (textArr[i] == ']') {
					text.append('</strong>');
				} else if (textArr[i] == '^') {
					text.append('');
				} else {
					text.append(textArr[i]);
				}

				if (scope.gameStarted) {
					i = 0;
					text.empty();
					return false;
				} else {
					if (i < textArr.length - 1) {
						showLetter();

						i++;
					} else {
						setTimeout(function () {
							text.empty();
							scope.animateText(texts[0]);
						}, 2000);
					}
				}
			}, delay);
		};

		showLetter();
		if (!this.isFlashing) {
			flashUnderscore();
		}
	}

	checkDone() {
		let done = false;
		for (let i in this.astronaut) {
			if (this.astronaut[i] == 2) {
				done = true;
			} else {
				done = false;
				break;
			}
		}

		if (done) {
			this.onDone();
		}
	}

	onDone() {
		console.log('zrobione');
		$('.medium-area').addClass('hidden');
		$('.astronaut-full').addClass('animated').css('transform', 'scale(0.7)');
	}
}