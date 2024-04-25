/* This component is not imported in `./index.js` like the rest,
	 as it imports index.js to load all other components, and list them.
	 It is intended as a way to introduce and navigate all r4 components..
 */

import {LitElement, html} from 'lit'
import componentDefinitions from '../index.js'

export default class R4Components extends LitElement {
	static properties = {
		components: {type: Object},
	}
	static shadowRootOptions = {...LitElement.shadowRootOptions, mode: 'open'}

	buildComponents(definitions) {
		return Object.entries(definitions).map(([cTag, cDef]) => ({
			name: cDef,
			slug: cTag,
		}))
	}
	async connectedCallback() {
		super.connectedCallback()
		this.components = this.buildComponents(componentDefinitions)
	}
	render() {
		return html`
			<ul>
				${this.components?.map(this.renderComponent.bind(this))}
			</ul>
		`
	}
	renderComponent(component) {
		return html`
			<li>
				<a href="/examples/${component.slug}/">${component.slug}</a>
				<small
					><a href="${`https://github.com/radio4000/components/blob/main/src/components/${component.slug}.js`}"
						>(source)</a
					></small
				>
			</li>
		`
	}
}
