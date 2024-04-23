/* This component is not imported in `./index.js` like the rest,
	 as it imports index.js to load all other components, and list them.
	 It is intended as a way to introduce and navigate all r4 components..
 */

const ComponentRoot = 'R4'

const camelToDash = (str) => {
	return str.replace(/([A-Z])/g, (val) => `-${val.toLowerCase()}`)
}

const slugFromName = (componentName) => {
	const camelName = componentName.split(ComponentRoot)[1]
	const dashName = camelToDash(camelName)
	return ComponentRoot.toLowerCase() + dashName
}

export default class R4Components extends HTMLElement {
	buildComponents(Components) {
		return Object.keys(Components)
			.filter((exportClass) => {
				return exportClass.startsWith(ComponentRoot)
			})
			.map((componentName) => {
				const Component = Components[componentName]
				const config = {
					name: componentName,
					HTMLElement: Component,
					slug: slugFromName(componentName),
				}
				return config
			})
	}
	async connectedCallback() {
		const {default: Components} = await import('./index.js')
		this.components = this.buildComponents(Components)
		if (this.components && this.components.length) {
			this.render()
		}
	}
	render() {
		const $menu = document.createElement('menu')
		this.components.forEach((component) => {
			const $li = document.createElement('li')
			$li.innerHTML = `
				<a href="/examples/${component.slug}/">${component.name}</a>
				<small><a href="${`https://github.com/radio4000/components/blob/main/src/components/${component.slug}.js`}">(source)</a></small>
			`
			$menu.append($li)
		})
		this.append($menu)
	}
}
