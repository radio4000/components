const template = document.createElement('template')
template.innerHTML = `
	<form>
		<slot name="fields"></slot>
		<slot name="submit">
			<fieldset>
				<button type="submit" name="submit">Submit</button>
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

	get fieldNames() {
		if (!this.$fieldsets) return []
		const names = []
		this.$fieldsets.forEach($fieldset => {
			let fieldName = $fieldset.querySelector('[name]').getAttribute('name')
			names.push(fieldName)
		})
		return names.filter(name => {
			return ['submit', 'password'].indexOf(name) === -1
		})
	}

	connectedCallback() {
		this.append(template.content.cloneNode(true))
		this.$form = this.querySelector('form')
		this.$form.addEventListener('submit', this.handleSubmit.bind(this))


		/* build DOM for each fieldset */
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
		this.initialState = this.getInitialState()
		this.bindFieldsInput(this.$fieldsets)
		this.render()
	}

	render() {}

	/* get initial config form state, from the URL params || DOM attributes */
	getInitialState() {
		const urlParams = new URLSearchParams(window.location.search)

		/* the initial config to populate */
		let config = {}

		if (!this.fieldNames) return config

		if (urlParams) {
			for (const [paramName, paramValue] of urlParams) {

				/* if the url param is not is the field names list, don't us */
				if (this.fieldNames.indexOf(paramName) === -1) return

				const value = decodeURIComponent(paramValue)
				if (value === 'null') {
				} else if (value) {
					config[paramName] = value
				}
			}
		}

		/* overwrite the URL params generated config, by the DOM attributes */
		this.fieldNames.forEach(fieldName => {
			const fieldAttributeValue = this.getAttribute(fieldName)
			if (fieldAttributeValue) {
				config[fieldName] = fieldAttributeValue
			}
		})

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
				const $label = $fieldset.querySelector('label')
				const fieldEventType = fieldTypes[fieldType]

				if (!$field || !fieldEventType) return true

				const fieldName = $field.getAttribute('name')

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

				/* add the id on the field "input", to make the label work with minimal markup */
				if (!$field.getAttribute('id')) {
					$field.setAttribute('id', fieldName)
				}
				if (!$label.getAttribute('for')) {
					$field.setAttribute('for', fieldName)
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

	async handleSubmit(submitData) {
		const { error, data } = submitData
		const submitEvent = new CustomEvent('submit', {
			bubbles: true,
			detail: {
				error,
				data,
			}
		})
		this.dispatchEvent(submitEvent)

		/*
			 // Example flow in a component extending this one
			 event.stopPropagation()
			 event.preventDefault()
			 this.disableForm()
			 const {error, data} = await this.myAsyncMethod()
			 this.resetForm()
			 this.enableForm()
			 super.handleSubmit({error,data})
		 */
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
		let  $out
		if (field) {
			$out = this.$form.querySelector(`output[for="${field}"]`)
		}
		if (!field || !$out) {
			$out = this.$form.querySelector(`output[for="submit"]`)
		}
		if ($out) {
			this.renderErrorOutput($out, { message, code })
		}
	}
	renderErrorOutput($out, { message, code }) {
		$out.style = 'color: var(--color-error, red);'

		const $message = document.createElement('span')
		$message.innerText = message

		const $code = document.createElement('code')
		$code.innerText = code

		$out.append($message)
		/* $out.append($code) */
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
