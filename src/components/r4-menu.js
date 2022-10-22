export default class R4Menu extends HTMLElement {
	static get observedAttributes() {
		return ['origin', 'pathname']
	}
	get origin() {
		const url = this.getAttribute('origin')
		if (url === 'null') {
			return null
		} else if (!url) {
			return `${window.origin}/`
		}
		return url
	}

	get pathname() {
		const path = this.getAttribute('pathname')
		if (path === 'null') {
			return null
		} else if (!path) {
			return undefined
		}
		return path
	}

	/* if the attribute changed, re-render */
	async attributeChangedCallback(attrName) {
		if (['origin', 'pathname'].indexOf(attrName) > -1) {
			this.render()
		}
	}

	/* move the children elements into list items */
	constructor() {
		super()
		this.$menu = document.createElement('menu')

		Object.keys(this.children).forEach(() => {
			let $children = this.normalizeChildrenLinks(this.children[0])
			let $li = document.createElement('li')


			$li.append($children)
			this.$menu.append($li)
		})
		this.append(this.$menu)
	}

	/* recursively update links */
	normalizeChildrenLinks($children) {
		if ($children.nodeName === 'A') {
			$children = this.normalizeLink($children)
		} else if ($children.children) {
			const $links = $children.querySelectorAll('a')
			$links.forEach($link => {
				$link = this.normalizeLink($link)
			})
		}
		return $children
	}

	normalizeLink($link) {
		console.log(this.pathname)
		const newHref = new URL($link.href, this.origin)
		$link.setAttribute('href', newHref)
		return $link
	}

	render() {
		this.normalizeChildrenLinks(this)
	}
}

class R4Link extends HTMLAnchorElement {
	connectedCallback() {
		console.log('r4-link connected', this)
	}
}

customElements.define('r4-link', R4Link, {extends: 'a'})
