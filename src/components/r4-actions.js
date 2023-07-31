export default class R4Actions extends HTMLElement {
	/* move the children elements into the select */
	connectedCallback() {
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
			detail: event.target.value,
		})
		this.dispatchEvent(inputEvent)
		this.resetSelect()
	}

	resetSelect() {
		this.$select.querySelector('option').selected = true
	}

	/*
		 actions, are the value="" attribute,
		 can be called from outside */

	/* check for known actions this component can handle;
	 returns true if can handle */
	checkAction(optionValue) {
		if (!optionValue) return
		/* is the command prefixed by "visit-" ? */
		const visitCommand = optionValue.split('visit-')
		if (visitCommand.length === 2) {
			this.visit(visitCommand[1])
			return true
		}
		return false
	}

	/* visit-{page} */
	visit(visitAction) {
		let url

		/* is it a known page */
		if (visitAction === 'home') {
			url = `/`
		} else {
			/* or a component page */
			url = `/examples/r4-${visitAction}`
		}
		this.navigate(url)
	}

	/*
		 commands,
		 are the results to actions
	 */

	/* navigate to a URL in the app;
 should use the app router (page.js) if any */
	navigate(url) {
		window.location.href = url
	}
}
