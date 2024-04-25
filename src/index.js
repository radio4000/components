import './index.css'
import {sdk} from './libs/sdk.js'
import componentDefinitions from './components/index.js'

/* component to list all others, has to be imported aloned for no circle deps */
import R4Components from './components/r4-components.js'

function defineComponents(components) {
	const isBrowser = typeof window !== 'undefined'
	if (!isBrowser) return
	Object.entries(components).map(([cTag, cDef]) => {
		if (!customElements.get(cTag)) {
			customElements.define(cTag, cDef)
		}
	})
}

/* Manualy define/register the web-components,
	 for ex if registering event templates */
if (window?.R4_MANUAL_DEFINE !== true) {
	defineComponents(componentDefinitions)
	defineComponents({
		'r4-components': R4Components,
	})
}

export {componentDefinitions as default, sdk, R4Components}
