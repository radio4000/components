// import Components from './index.js'
import Components from '../index.js'

const camelToDash = str => {
	return str.replace(/([A-Z])/g, val => `-${val.toLowerCase()}`)
}

const slugFromName = componentName => {
	const root = 'R4'
	const camelName = componentName.split(root)[1]
	const dashName = camelToDash(camelName)
	return root.toLowerCase() + dashName
}

class R4Components extends HTMLElement {
	get components() {
		return Object.keys(Components).map(componentName => {
			console.log(componentName)
			const Component = Components[componentName]
			const config = {
				name: componentName,
				HTMLElement: Component,
				slug: slugFromName(componentName)
			}
			return config
		})
	}
	connectedCallback() {
		console.log('components', this.components)
		if (this.components && this.components.length) {
			this.render()
		}
	}
	render() {
		const $menu = document.createElement('menu')
		this.components.forEach(component => {
			const $li = document.createElement('li')
			const $componentLink = document.createElement('a')
			$componentLink.innerText = component.name
			$componentLink.href = `./${component.slug}/`
			$li.append($componentLink)
			$menu.append($li)
		})
		this.append($menu)
	}
}

customElements.define('r4-components', R4Components)

export default {
	R4Components
}
