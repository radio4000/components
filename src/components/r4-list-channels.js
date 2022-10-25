import sdk from '@radio4000/sdk'

const template = document.createElement('template')
template.innerHTML = `
	<main name="list"></main>
	<aside name="pagination"></aside>
`

/*
	 list-channels, default `page="1"`, `limit="1"`
 */
export default class R4ListChannels extends HTMLElement {
	upperLimit = 999

	static get observedAttributes() {
		return ['loading', 'limit', 'channels', 'origin', 'page']
	}
	get limit() {
		const attr = parseFloat(this.getAttribute('limit'))
		if (!attr || attr <= 0) {
			return  1
		} else if (attr > this.upperLimit) {
			return this.upperLimit
		} else {
			return attr
		}
	}
	get page() {
		const attr = parseFloat(this.getAttribute('page'))
		if (!attr || attr <= 0) {
			return 1
		} else {
			return attr
		}
	}
	set page(digit) {
		if (digit) {
			this.setAttribute('page', parseFloat(digit))
		} else {
			this.removeAttribute('page')
		}
	}
	get channels() {
		return JSON.parse(this.getAttribute('channels'))
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
	set channels(arr = []) {
		this.removeAttribute('loading')
		this.setAttribute('channels', JSON.stringify(arr))
		return arr
	}

	/* if the attribute changed, re-render */
	async attributeChangedCallback(attrName) {
		if (['page'].indexOf(attrName) > -1) {
			await this.updateChannels()
		}
		if (['channels', 'page'].indexOf(attrName) > -1) {
			this.render()
		}
	}

	constructor() {
		super()
		this.append(template.content.cloneNode(true))
		this.$list = this.querySelector('[name="list"')
		this.$pagination = this.querySelector('[name="pagination"')
		this.$pagination.addEventListener('click', this.onPagination.bind(this))
	}

	/* set loading */
	async connectedCallback() {
		this.setAttribute('loading', true)
		await this.updateChannels()
	}

	async updateChannels() {
		/* const res = await sdk.findChannels(this.limit) */
		const res = await this.browseChannels({
			page: this.page,
			limit: this.limit,
		})
		this.channels = res.data
	}

	async browseChannels({page, limit}) {
		const { from, to, limitResults } = this.getBrowseParams({ page, limit })
		return sdk.supabase.from('channels').select('*').limit(limitResults).order('created_at', { ascending: true }).range(from, to)
	}

	/*
		 converts web component attributes, to supabase sdk query parameters:
		 -> page="1" limit="1"
		 -> from[0] to to[0] limit[0]
	 */
	getBrowseParams({page, limit}) {
		let from, to, limitResults;
		from = page - 1
		to = from + limit - 1
		limitResults = limit - 1
		return { from, to, limitResults }
	}

	render() {
		if (!this.channels.length) {
			this.renderNoChannels()
		} else {
			this.renderChannels()
		}
		this.renderPagination()
	}
	renderChannels() {
		this.$list.innerHTML = ''
		const $ul = document.createElement('ul')
		this.channels.forEach(channel => {
			const $li = document.createElement('li')
			const $item = document.createElement('r4-list-channels-item')
			$item.setAttribute('channel', JSON.stringify(channel))
			this.origin && $item.setAttribute('origin', this.origin)
			$li.append($item)
			$ul.append($li)
		})
		this.$list.append($ul)
	}
	renderNoChannels() {
		this.$list.innerHTML = ''
		const $ul = document.createElement('ul')
		const $li = document.createElement('li')
		$li.innerText = 'No channel'
		$ul.append($li)
		this.$list.append($ul)
	}
	renderPagination() {
		this.$pagination.innerHTML = ''

		const $previous = document.createElement('button')
		$previous.setAttribute('name', 'before')
		$previous.innerText = 'before'

		const $next = document.createElement('button')
		$next.setAttribute('name', 'after')
		$next.innerText = 'after'

		const $current = document.createElement('span')
		$current.innerText = this.page

		this.$pagination.append($previous)
		this.$pagination.append($current)
		this.$pagination.append($next)

		if (this.page === 1) {
			$previous.setAttribute('disabled', true)
		}

		if (this.channels.length < this.limit) {
			$next.setAttribute('disabled', true)
		}
	}
	onPagination(event) {
		const { name } = event.target
		if (name === 'before') {
			this.page = this.page - 1
		}
		if (name === 'after') {
			this.page = this.page + 1
		}
	}
}

class R4ListChannelsItem extends HTMLElement {
	static get observedAttributes() {
		return ['channel']
	}
	get channel() {
		return JSON.parse(this.getAttribute('channel'))
	}
	get origin() {
		/* origin can have tokens: {{token_name}} */
		return this.getAttribute('origin')
	}
	/* if the attribute changed, re-render */
	attributeChangedCallback(attrName) {
		if (
			['channel'].indexOf(attrName) > -1
		) {
			this.render()
		}
	}

	replaceUrlTokens (url, channel) {
		const {
			slug = '',
			id = '',
			title = '',
		} = channel
		url = url.replace('{{slug}}', slug)
		url = url.replace('{{id}}', id)
		url = url.replace('{{title}}', title)
		return url
	}

	connectedCallback() {
		this.render()
	}
	render() {
		const { id, slug, name, description } = this.channel
		this.innerHTML = ''

		let $title
		if (this.origin) {
			$title = document.createElement('a')
			const url = new URL(this.replaceUrlTokens(this.origin, this.channel))
			$title.href = url.href
		} else {
			$title = document.createElement('span')
		}
		$title.innerText = slug

		let $actions = document.createElement('r4-channel-actions')
		$actions.setAttribute('slug', slug)

		this.append($title)
		this.append($actions)
	}
}
customElements.define('r4-list-channels-item', R4ListChannelsItem)
