export default class R4Actions extends HTMLElement {
	constructor() {
		super()
		console.log(this)
		this.$select = document.createElement('select')
		this.$select.addEventListener('input', this.onInput.bind(this))

		Object.keys(this.children).forEach(() => {
			const $option = this.children[0]

			/* the default option has no value, used as title */
			if (!$option.value) {
				$option.defaultSelected = true
				$option.disabled = true
			}
			this.$select.append($option)
		})
		this.append(this.$select)
	}
	onInput(event) {
		event.stopPropagation()
		event.preventDefault()

		const inputEvent = new CustomEvent('input', {
			bubbles: true,
			detail: event.target.value
		})
		this.dispatchEvent(inputEvent)
		this.resetSelect()
	}
	resetSelect() {
		this.$select.querySelector('option').selected = true
	}
}
