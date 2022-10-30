/* a r4-page component, to be extended by other pages */
const pageTemplate = document.createElement('template')
pageTemplate.innerHTML = `<span>Test</span>`

export default class R4Page extends HTMLElement {
	/* template = pageTemplate */
	template = null

	get href() {
		return this.getAttribute('href')
	}

	connectedCallback() {
		if (!this.template) return
		this.$page = this.template.content.cloneNode(true)
		this.render()
	}
	normalizeTemplateLinks(templateDom) {
		templateDom.querySelectorAll('a').forEach($link => {
			$link.href = this.href + new URL($link.href).pathname
		})
		return templateDom
	}
	render() {
		const $page = this.normalizeTemplateLinks(this.$page)
		this.append($page)
	}
}
