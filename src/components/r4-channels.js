import R4List from './r4-list.js'

const itemTemplate = document.createElement('template')
itemTemplate.setAttribute('element', 'r4-channel')
/* itemTemplate.setAttribute('attribute', 'slug') */
itemTemplate.innerHTML = `<r4-channel slug=""><r4-channel/>`

export default class R4ListChannels extends R4List {
	itemTemplate = itemTemplate
	model = 'channels'
	select = 'slug'
}
