import {LitElement, html} from 'lit'
import page from 'page/page.mjs'
import '../libs/command-menu.js'

/**
 * This is how a "command" looks like. See generateCommands() for the actual ones we use.
 * @typedef {Object} Command
 * @property {String} title - The title of the command
 * @property {String} [subtitle] - A description of the command
 * @property {String} [shortcut] - A keyboard shortcut, e.g. "Ctrl+K"
 * @property {Function} [action] - The function to call when the command is selected
 * @property {Array<Command>} [children] - A list of child commands
 */

// Generates the list of commands and passes it to <command-menu>.
export default class R4CommandMenu extends LitElement {
	static get properties() {
		return {
			config: {type: Object, state: true},
			store: {type: Object, state: true},
		}
	}

	render() {
		return html`<command-menu modal .commands=${this.generateCommands()}></command-menu>`
	}

	/** @arg {string} route */
	go(route) {
		page.redirect(route)
	}

	/**
	 * Creates a list of commands from the config and store
	 * @returns {Array.<Command>}
	 */
	generateCommands() {
		const {config, store} = this
		const params = document.querySelector('r4-router')?.params
		const go = this.go

		const cmds = []
		cmds.push({title: 'R4 Home', action: () => go('/')})
		// cmds.push({title: 'Search radios', action: () => go('/explore')})
		cmds.push({title: 'Explore', subtitle: 'All radio channels', action: () => go('/explore')})
		cmds.push({title: 'Map', subtitle: 'a cool map', action: () => go('/map')})

		// If on a slug (channel) page
		const slug = params?.slug
		if (slug) {
			cmds.push(
				{title: 'Tracks', action: () => go('/tracks')},
				{title: 'Following', action: () => go('/following')},
				{title: 'Followers', action: () => go('/followers')},
				// {title: 'Feed', action: () => go('/feed')}
			)
		}

		// User channel
		if (config?.selectedSlug) {
			const c = store.userChannels.find((x) => x.slug === config.selectedSlug)
			if (c) {
				cmds.push({title: c.slug, subtitle: c.name, action: () => go('/' + c.slug)})
				cmds.push(
					{title: 'Add track', action: () => go('/add')},
					{title: 'Update radio', action: () => go('/' + c.slug + '/update')},
				)
			}
		}

		// User-related commands
		if (store?.user) {
			cmds.push(
				{
					title: 'Settings',
					subtitle: 'Your account, appearance and customizations',
					action: () => go('/settings'),
				},
				{title: 'Sign out', action: () => go('/sign/out')},
			)
		} else {
			cmds.push(
				{title: 'Sign up', subtitle: 'Create new radio channel', action: () => go('/sign/up')},
				{title: 'Sign in', subtitle: 'My radio', action: () => go('/sign/in')},
			)
		}

		console.debug('Generated commands for <command-menu>', {config, store, params}, cmds)

		return cmds
	}
}
