import sdk from '@radio4000/sdk'

const template = document.createElement('template')
template.innerHTML = `
	<main name="list"></main>
	<aside name="pagination"></aside>
`

export default class R4ListChannels extends HTMLElement {
	static get observedAttributes() {
		return ['loading', 'limit', 'channels', 'origin', 'page']
	}
	get limit() {
		return parseFloat(this.getAttribute('limit')) || 0
	}
	get page() {
		return parseFloat(this.getAttribute('page')) || 0
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
		const res = await this.browseChannels()
		this.channels = res.data
	}

	async browseChannels() {
		const {from, to} = this.getBrowseParams()
		return sdk.supabase.from('channels').select('*').limit(this.limit).order('created_at', { ascending: true }).range(from, to)
	}

	getBrowseParams() {

		let from, to;

		if (this.page) {
			from = this.page * this.limit
		} else {
			from = this.page
		}

		if (this.limit) {
			to = (this.page || 1) * this.limit
		} else {
			to = this.page
		}

		console.log(from, to, '||', this.page, this.limit)

		return { from, to }
	}

	render() {
		if (!this.channels) {
			this.renderNoChannels()
		} else {
			this.renderChannels()
			this.renderPagination()
		}
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
		const $text = document.createElement('p')
		$text.innerText = 'No channels'
		this.append($text)
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

		if (this.channels.length < this.limit) {
			$next.setAttribute('disabled', true)
		}
		if (this.page === 0) {
			$previous.setAttribute('disabled', true)
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
