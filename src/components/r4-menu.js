export default class R4Menu extends HTMLElement {
	get origin() {
		const url = this.getAttribute('origin')
		if (url === 'null') {
			return null
		} else if (!url) {
			return `${window.origin}`
		}
		return url
	}

	get pathname() {
		let path = this.getAttribute('pathname')
		if (path === 'null' || !path) {
			path = '/'
		}
		return path
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
		console.log(this.origin, this.pathname)
		const newHref = new URL($link.href, this.origin + this.pathname)
		$link.href = newHref
		return $link
	}
}
