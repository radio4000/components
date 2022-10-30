import R4List from './r4-list.js'

const itemTemplate = document.createElement('template')
itemTemplate.setAttribute('element', 'r4-channel')
itemTemplate.setAttribute('attribute', 'channel')
itemTemplate.innerHTML = `<r4-channel><r4-channel/>`

export default class R4ListChannels extends R4List {
	itemTemplate = itemTemplate
	model = 'channels'

	select = '*'

	/*
		 Could also use
		 itemTemplate.innerHTML = `<r4-channel slug><r4-channel/>`
		 and just `select` the `slug` in the query,
		 to have the r4-channel fetch the channel data itself,
		 and this list only answer for the `slug` of all channels
	 */
	/* select = 'slug' */
}
