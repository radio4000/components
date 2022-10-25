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
	connectedCallback() {
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
			$children = this.buildMenuLink($children)
		} else if ($children.children) {
			const $links = $children.querySelectorAll('a')
			$links.forEach($link => {
				$link = this.buildMenuLink($link)
			})
		}
		return $children
	}

	navigate(relativeHref, params = []) {
		const location = this.buildMenuURL(relativeHref, params)
		window.location.assign(location.href)
	}

	buildMenuLink($link) {
		$link.href = this.buildMenuURL($link.href).href
		return $link
	}

	buildMenuURL(href, queryParams) {
		const newUrl = new URL(href, this.origin + this.pathname)
		if (queryParams && queryParams.length) {
			/* fix the router re-routing to `/` for folders,
			 and that removes the query params */
			if (!newUrl.href.endsWith('/')) {
				newUrl.href = newUrl.href + '/'
			}
			queryParams.forEach(param => {
				newUrl.searchParams.set(param[0], param[1])
			})
		}
		return newUrl
	}
}
