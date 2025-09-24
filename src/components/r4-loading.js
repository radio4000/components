/**
 * Loading indicator with progress bar and multilingual messages
 */
export default class R4Loading extends HTMLElement {
	static get observedAttributes() {
		return ['text', 'show-icon']
	}
	/* attr */
	get text() {
		return this.getAttribute('text')
	}
	set text(text) {
		this.setAttribute('text', text)
	}
	get value() {
		return Number(this.getAttribute('value'))
	}
	get max() {
		return Number(this.getAttribute('max'))
	}

	/* helpers */
	get sentences() {
		return SENTENCES
	}
	get randomSentence() {
		return this.sentences[Math.floor(Math.random() * this.sentences.length)]
	}
	attributeChangedCallback() {
		this.render()
	}
	connectedCallback() {
		if (!this.text) {
			this.text = this.randomSentence
		}
		this.render()
	}
	render({text = this.text, value = this.value, max = this.max} = {}) {
		const progress = document.createElement('progress')
		if (value && max) {
			progress.setAttribute('value', value)
			progress.setAttribute('max', max)
		}
		this.replaceChildren(progress, text)
	}
}

const SENTENCES = [
	'Unu momenton, mi petas',
	'Un momento por favor',
	'لحظة واحدة من فضلك',
	'Один момент, пожалуйста',
	'Une batez, mesedez',
	'এক মিনিট, প্লিজ',
	'稍等一会儿',
	'Et øjeblik',
	'Een ogenblik alstublieft',
	'Unu momenton, bonvolu',
	'Hetkinen',
	"Un instant s'il vous plaît",
	'Einen Moment bitte',
	'Μια στιγμή παρακαλώ',
	'Yon sèl moman, tanpri',
	'कृपया एक क्षण',
	'Nóiméad amháin, le do thoil',
	'Un momento per favore',
	'少々お待ちください',
	'Uno momento, placet',
	'Един момент моля',
	'Et øyeblikk',
	'Chwileczkę',
	'Um momento por favor',
	'Wakati mmoja, tafadhali',
	'Ett ögonblick tack',
	'กรุณารอสักครู่',
	'Bir dakika lütfen',
	'Un funud, os gwelwch yn dda',
	'Omunye mzuzu, sicela',
]
