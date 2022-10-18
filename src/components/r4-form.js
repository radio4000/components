const template = document.createElement('template')
template.innerHTML = `
	<form>
		<slot name="fields"></slot>
		<slot name="submit">
			<fieldset>
				<button type="submit" name="submit">submit</button>
			</fieldset>
		</slot>
	</form>
`

export default class R4Form extends HTMLElement {
	/* the state of the form (state[input-name]) */
	state = {}

	errors = {
		'default': {
			message: 'Unhandled error',
			field: null,
		}
	}

	fieldsTemplate = null

	connectedCallback() {
		this.append(template.content.cloneNode(true))
		this.$form = this.querySelector('form')
		this.$form.addEventListener('submit', this.handleSubmit.bind(this))

		this.initialState = this.getInitialState()

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

	/* from the url params */
	getInitialState() {
		const urlParams = new URLSearchParams(window.location.search)
		let config = {}
		for (const [paramName, paramValue] of urlParams) {
			const value = decodeURIComponent(paramValue)
			if (value === 'null') {
			} else if (value) {
				config[paramName] = value
			}
		}
		return config
	}

	bindFieldsInput($fieldsets) {
		if (!$fieldsets) return

		const fieldTypes = {
			input: 'input',
			textarea: 'input',
			button: null,
		}

		$fieldsets.forEach($fieldset => {
			/* listen for changes,
				 and create only one field(in+out) per fieldset */
			Object.keys(fieldTypes).every(fieldType => {
				const $field = $fieldset.querySelector(fieldType)
				const fieldEventType = fieldTypes[fieldType]
				if (!$field || !fieldEventType) return true

				const $errorOutput = this.createFieldsetOutput($field)
				$fieldset.append($errorOutput)

				if (fieldEventType) {
					$field.addEventListener(fieldEventType, this.handleInput.bind(this))
				}

				const initialFieldState = this.initialState[$field.name]
				if (initialFieldState) {
					$field.value = initialFieldState
					$field.dispatchEvent(new Event('input')) // trigger initial value
				}

				/* return false, to stop the "every" loop,
					 since the field type has been found and set */
				return false
			})
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
		console.info('form:error', this, error)
		const { code = 'default' } = error
		const { message, field } = this.errors[code]
		error.field = field
		error.message = message || error.message

		/* reset all existing outputs */
		this.$form.querySelectorAll('output').forEach($out => {
			$out.innerHTML = ''
		})
		/* set errors on outputs */
		const $out = this.$form.querySelector(`output[for="${field}"]`)
		if ($out) {
			this.renderErrorOutput($out, { message, code, field })
		}
	}
	renderErrorOutput($out, { message, code, field }) {
		const $message = document.createElement('span')
		$message.innerText = message

		const $code = document.createElement('code')
		$code.innerText = code

		const $field = document.createElement('i')
		$code.innerText = field

		$out.append($message)
		$out.append($code)
		$out.append($field)
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
