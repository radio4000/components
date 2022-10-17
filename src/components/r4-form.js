const template = document.createElement('template')
template.innerHTML = `
	<form>
		<slot name="fields"></slot>
		<slot name="submit">
			<fieldset>
				<button type="submit">submit</button>
			</fieldset>
		</slot>
	</form>
`

export default class R4Form extends HTMLElement {
	/* the state of the form (state[input-name]) */
	state = {}

	fieldsTemplate = null

	connectedCallback() {
		this.append(template.content.cloneNode(true))
		this.$form = this.querySelector('form')
		this.$form.addEventListener('submit', this.handleSubmit.bind(this))

		this.$fields = this.querySelector('slot[name="fields"')
		if (this.fieldsTemplate) {
			const $newFieldsets = this.fieldsTemplate.content.cloneNode(true).querySelectorAll('slot[name="fields"] fieldset')
			if ($newFieldsets) {
				$newFieldsets.forEach($newFieldset => {
					this.$fields.append($newFieldset)
				})
			}
		}
		this.$fieldsets = this.querySelectorAll('fieldset')
		this.bindFieldsInput(this.$fieldsets)
		this.render()
	}
	render() {}

	bindFieldsInput($fieldsets) {
		if (!$fieldsets) return
		$fieldsets.forEach($fieldset => {
			const $field = $fieldset.querySelector('input')
			if (!$field) return
			$field.addEventListener('input', this.handleInput.bind(this))
			const $errorOutput = this.createFieldsetOutput($field)
			$fieldset.append($errorOutput)
		})
	}

	handleInput({ target }) {
		const { name, value } = target
		this.state = {
			...this.state,
			[name]: value
		}
	}

	createFieldsetOutput($el) {
		const $output = document.createElement('output')
		$output.setAttribute('for', $el.name)
		$output.value = ''
		return $output
	}

	async handleSubmit(event) {
		event.preventDefault()
		this.disableForm()
		// ex: await this.submit()
		this.resetForm()
		this.enableForm()
	}

	handleError(error) {
		const { field, message, code } = error
		console.log('form:error', error)
		/* reset all existing outputs */
		this.$form.querySelectorAll('output').forEach($out => {
			$out.innerText = ''
		})
		/* set errors on outputs */
		const $out = this.$form.querySelector(`output[for="${field}"]`)
		if ($out) {
			$out.innerText = `${message} [${code}:${field}]`
		}
	}

	disableForm() {
		this.$fieldsets.forEach($fieldset => {
			$fieldset.setAttribute('disabled', true)
		})
		this.setAttribute('loading', true)
	}

	enableForm() {
		this.$fieldsets.forEach($fieldset => {
			$fieldset.removeAttribute('disabled')
		})
		this.removeAttribute('loading')
	}

	resetForm() {
		if (this.$form) {
			this.$form.reset()
		}
	}
}
