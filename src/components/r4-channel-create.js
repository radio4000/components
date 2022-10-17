import sdk from '@radio4000/sdk'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="title">Title</label>
			<input name="title" type="text"/>
		</fieldset>
		<fieldset>
			<label for="slug">Slug</label>
			<input name="slug" type="text" required/>
		</fieldset>
	</slot>
`


export default class R4ChannelCreate extends R4Form {
	constructor() {
		super()
		this.fieldsTemplate = fieldsTemplate
	}

	async connectedCallback() {
		super.connectedCallback()
	}

	render() {
		super.render()
	}

	handleSubmit(event) {
		event.preventDefault()
		/* super.handleSubmit(event) */
		console.log('submit:form.state', this.state)
	}
}
