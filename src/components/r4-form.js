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
	/* the attributes of the children class,
		 that should "re-set" data from attributes */
	static get observedAttributes() {
		return []
	}

	/* the state of the form (state[input-name]) */
	state = {}

	errors = {
		default: {
			message: 'Unhandled error',
			field: null,
		},
	}

	fieldsTemplate = null

	get submitText() {
		return this.getAttribute('submit-text') || 'Submit'
	}

	/* all fieldsets' field names attributes (on input, textarea etc.) */
	get fieldNames() {
		if (!this.$fieldsets) return []
		const names = []
		this.$fieldsets.forEach(($fieldset) => {
			let fieldName = $fieldset.querySelector('[name]').getAttribute('name')
			names.push(fieldName)
		})
		return names
	}

	attributeChangedCallback(attrName) {
		/* get the observed atributes of the children class */
		if (this.constructor.observedAttributes.indexOf(attrName) > -1) {
			this.init()
		}
	}

	connectedCallback() {
		this.init()
	}

	init() {
		this.innerHTML = ''
		this.append(template.content.cloneNode(true))
		this.$form = this.querySelector('form')
		this.$form.addEventListener('submit', this.handleSubmit.bind(this))
		this.$form.addEventListener('keydown', this.handleKeydown.bind(this))

		/* build DOM for each fieldset */
		this.$fields = this.querySelector('slot[name="fields"')
		if (this.fieldsTemplate) {
			const $newFieldsets = this.fieldsTemplate.content.cloneNode(true).querySelectorAll('slot[name="fields"] fieldset')
			if ($newFieldsets) {
				$newFieldsets.forEach(($newFieldset) => {
					this.$fields.append($newFieldset)
				})
			}
		}

		this.$fieldsets = this.querySelectorAll('fieldset')
		this.initialState = this.getInitialState()
		this.bindFieldsInput(this.$fieldsets)
	}

	/*
		 get initial state for some form fields;
		 from the URL params || DOM attributes
	 */
	getInitialState() {
		/* the initial state to populate */
		let state = {}

		/* for some fields we don't want to preffil */
		const fieldNamesNoPrefill = ['submit', 'password', 'confirmation']
		const fieldNamesPrefill = this.fieldNames.filter((name) => {
			return fieldNamesNoPrefill.indexOf(name) === -1
		})

		if (!fieldNamesPrefill) return state

		/* first prefill from the URL query parameters */
		const urlParams = new URLSearchParams(window.location.search)
		if (urlParams) {
			for (const [paramName, paramValue] of urlParams) {
				/* if the url param is not is the field names list, break loop */
				if (fieldNamesPrefill.indexOf(paramName) === -1) {
					break
				}

				const value = decodeURIComponent(paramValue)
				if (value === 'null') {
					//
				} else if (value) {
					state[paramName] = value
				}
			}
		}

		/* overwrite the URL params generated state, by the DOM attributes */
		fieldNamesPrefill.forEach((fieldName) => {
			/* firebase data model to html element dom attribute  */
			const fieldAttributeName = fieldName.replace('_', '-')
			const fieldAttributeValue = this.getAttribute(fieldAttributeName)
			if (fieldAttributeValue) {
				state[fieldName] = fieldAttributeValue
			}
		})

		return state
	}

	bindFieldsInput($fieldsets) {
		if (!$fieldsets) return

		/* map of: filed-type <-> field-event-type */
		const fieldTypes = {
			input: 'input',
			textarea: 'input',
			button: null,
		}

		/* in all the current form's fieldsets */
		$fieldsets.forEach(($fieldset) => {
			/*
				 - find the first matching "input field type" (textarea, input, select, etc.)
				 - create only one "field output error" per fieldset
				 - bind field changes, set its initial value (from URL query-parmas || DOM attributes)
			 */
			Object.keys(fieldTypes).every((fieldType) => {
				const $field = $fieldset.querySelector(fieldType)
				const $legend = $fieldset.querySelector('legend')
				const fieldEventType = fieldTypes[fieldType]

				/* if not field for the current field type we're checking for,
					 break the every loop, to find if there is a field of an other type  */
				if (!$field) return true

				/* find the name of the "input field" we are dealing with */
				const fieldName = $field.getAttribute('name')

				const $errorOutput = this.createFieldsetOutput($field)
				$fieldset.append($errorOutput)

				/* if there is an event type for this field's input:
					 - bind event for input changes
					 - set the initial possible state
				 */
				if (fieldEventType) {
					$field.addEventListener(fieldEventType, this.handleInput.bind(this))

					/* find an initial field value */
					const initialFieldState = this.initialState[$field.name]
					if (initialFieldState) {
						$field.value = initialFieldState
						$field.dispatchEvent(new Event('input')) // trigger initial value
					}
				}

				/* add the id on the field "input", to make the legend work with minimal markup */
				if (!fieldName === 'submit' && !$field.getAttribute('id')) {
					$field.setAttribute('id', fieldName)
				}

				if ($legend && !$legend.getAttribute('for')) {
					$field.setAttribute('for', fieldName)
				}

				if (fieldName === 'submit') {
					$field.setAttribute('role', 'primary')
					$field.innerText = this.submitText
				}

				/* return false, to stop the "every" loop,
					 since the field type has been found and set */
				return false
			})
		})
	}

	handleInput({target}) {
		const {name, value} = target
		this.state = {
			...this.state,
			[name]: value,
		}
	}

	createFieldsetOutput($el) {
		const $output = document.createElement('output')
		$output.setAttribute('for', $el.name)
		$output.value = ''
		return $output
	}

	// Allow forms to be submitted with ctrl/cmd + enter
	handleKeydown(event) {
		if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
			event.target.form?.requestSubmit()
		}
	}

	async handleSubmit(submitData) {
		const {error, data} = submitData
		const submitEvent = new CustomEvent('submit', {
			bubbles: true,
			detail: {
				error,
				data,
			},
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
		/* reset all existing outputs */
		this.$form.querySelectorAll('output').forEach(($out) => {
			$out.innerHTML = ''
		})


		const {code = 'default'} = error
		const knownError = this.errors[error.code] || this.errors.default
			console.log(error, knownError)
		if (!error.code) {
			console.log(error)
		}
		const {message, field} = knownError

		/* set errors on outputs */
		let $out
		if (field) {
			$out = this.$form.querySelector(`output[for="${field}"]`)
		}
		if (!field || !$out) {
			$out = this.$form.querySelector(`output[for="submit"]`)
		}
		if ($out) {
			this.renderErrorOutput($out, {message, code})
		}
	}

	renderErrorOutput($out, {message, code}) {
		$out.style = 'color: var(--color-error, red);'

		const $message = document.createElement('span')
		$message.innerText = message

		const $code = document.createElement('code')
		$code.innerText = code

		$out.append($message)
		/* $out.append($code) */
	}

	disableForm() {
		this.$fieldsets.forEach(($fieldset) => {
			$fieldset.setAttribute('disabled', true)
		})
		this.setAttribute('loading', true)
	}

	enableForm() {
		this.$fieldsets.forEach(($fieldset) => {
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
