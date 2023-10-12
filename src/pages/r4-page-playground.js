import {LitElement, html} from 'lit'

export default class R4PagePlayground extends LitElement {
	// Define the elements properties here.
	static properties = {
		// These four are passed down from r4-router.
		store: {type: Object},
		config: {type: Object},
		params: {type: Object},
		searchParams: {type: Object},

		// Note, reflect is ignored for "state" properties.
		age: {type: Number, reflect: true},
	}

	constructor() {
		// Remember to call super.
		super()

		// Default values can be set here.
		this.age = 42

		// In the constructor the element is not yet connected to the DOM,
		// and we don't have access to any passed down props.
	}

	async connectedCallback() {
		// Again, remember to call super.
		super.connectedCallback()
		console.log('component:connected', {
			store: this.store,
			config: this.config,
			searchParams: this.searchParams,
			params: this.params,
			age: this.age,
		})
	}

	render() {
		console.log('component:render')
		return html`
			<h1>Playground</h1>
			<p>params = ${this.params.color}</p>
			<p>page = ${this.searchParams.get('page')}</p>
			<p>Update search params with a regular link:</p>
			<menu>
				<a href="/examples/r4-app/playground/hotpink">/hotpink</a>
				<a href="/examples/r4-app/playground/red">/red</a><br />
				<a href="/examples/r4-app/playground/yellow?page=2">/yellow?page=2</a>
				<a href="/examples/r4-app/playground/yellow?page=666">/yellow?page=666</a>
				- notice how it re-renders
			</menu>
		`
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}
