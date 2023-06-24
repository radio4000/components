import {LitElement, html, css} from 'lit'
import fuzzysort from 'https://cdn.skypack.dev/fuzzysort'

// copy pasted from github.com/oskarrough/command-menu

/**
 * @typedef {Object} Command
 * @property {String} title - The title of the command
 * @property {String} [subtitle] - A description of the command
 * @property {String} [shortcut] - A keyboard shortcut, e.g. "Ctrl+K"
 * @property {Function} [action] - The function to call when the command is selected
 * @property {Array<Command>} [children] - A list of child commands
 */

class CommandMenu extends LitElement {
	static get properties() {
		return {
			// REQUIRED: Set this property as an array of Commands to make it work.
			commands: {type: 'Array'},
			// Render as a modal dialog.
			modal: {type: 'Boolean', reflect: true},
			// Whether to show the list of commands before the user interacts.
			showList: {type: 'Boolean'},
			// Adding a search will enable fuzzy search for the commands
			search: {type: 'String'},
			// Internal state
			filteredCommands: {type: 'Array', state: true},
		}
	}

	static styles = css`
		:host {
			--bg1: hsl(0deg 23% 95%);
			--bg2: hsl(0deg 23% 97%);
			--bg3: hsl(0deg 23% 99%);
			--bg1: var(--c-bg);
			--bg2: var(--c-bg2);
			--bg3: var(--c-bg3);
			--accent: var(--c-link);
		}

		:host([modal]) {}

		dialog {
			width: 100%;
			padding: 0;
			background: var(--bg1);
			border: 2px solid var(--accent);
			border-radius: 0.3em;

			position: absolute;
			z-index: 100;
			top: 10vh;
			left: 0;
			right: 0;
			bottom: 0;
			margin: 0 auto auto;
			max-width: 640px;
		}
		dialog::backdrop {
			background: hsla(0 0% 20%, 0.5);
		}

		command-menu-inner {
			display: flex;
			flex-flow: column nowrap;
			max-height: 400px;
			overflow: auto;
			box-shadow: rgba(0, 0, 0, 0.5) 0px 1em 4em;
		}
		:host([hidden]) {
			display: none;
		}
		command-menu-input {
			position: sticky;
			top: 0;
		}
		input[type='search'] {
			width: 100%;
			padding: 1em;
			font-family: inherit;
			font-size: 1em;
			border: 0;
			border-bottom: 1px solid hsla(0deg 0% 0% / 20%);
			background: var(--bg2);
		}
		input[type='search']:focus {
			outline: none;
			background: var(--bg3);
		}
		command-menu-list {
			display: flex;
			flex-flow: column;
			box-sizing: border-box;
			width: 100%;
		}
		command-menu-list:has(command-menu-item) {
			padding: 0.5em;
		}
		command-menu-item {
			display: flex;
			flex-flow: row wrap;
			justify-content: flex-start;
			gap: 0.4em;
			padding: 0.6em 0.6em;
		}
		command-menu-item:focus,
		command-menu-input:has(:focus-within) + command-menu-list > command-menu-item:first-child {
			outline: 2px solid;
			outline: 0;
			background: hsla(0deg 0% 80% / 70%);
			border-radius: 0.5em;
		}
		command-menu-item-subtitle {
			opacity: 0.5;
		}
		command-menu-item kbd {
			display: inline-block;
			font-size: 0.875rem;
			margin-left: auto;
			margin-bottom: auto;
			padding: 0 0.4em 0.1em;
			line-height: initial;
			background-color: #fafbfc;
			border: solid 1px #d1d5da;
			border-bottom-color: #c6cbd1;
			border-radius: 3px;
			box-shadow: inset 0 -1px 0 #c6cbd1;
			flex-shrink: 0;
		}
		[hidden] {
			display: none;
		}
	`

	connectedCallback() {
		super.connectedCallback()

		if (this.hasAttribute('modal')) {
			this.setAttribute('hidden', true)
			document.addEventListener('keydown', (event) => {
				if ((event.ctrlKey || event.metaKey) && event.key == 'k') {
					event.preventDefault()
					this.toggle()
				}
			})
		}

		this.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				event.preventDefault()
				this.close()
			}
		})

		// Close on click outside
		this.addEventListener('click', (event) => {
			event.preventDefault()
			const el = this.shadowRoot.querySelector('command-menu-inner')
			const rect = el.getBoundingClientRect()
			const isInDialog =
				rect.top <= event.clientY &&
				event.clientY <= rect.top + rect.height &&
				rect.left <= event.clientX &&
				event.clientX <= rect.left + rect.width
			if (!isInDialog) this.close()
		})
	}

	get filteredCommands() {
		if (this.search) {
			const flattenedCommands = this.commands.flatMap((cmd) => (cmd.children?.length ? [cmd, ...cmd.children] : cmd))
			const results = fuzzysort.go(this.search, flattenedCommands, {keys: ['title']})
			return results.map((result) => result.obj)
		}
		return this.commands
	}

	onClick(event) {
		this.onEnter(event.target.item)
	}

	onListKeydown(event) {
		console.log('keydown', event.key)
		if (typeof this['on' + event.key] === 'function') {
			event.preventDefault()
			this['on' + event.key]()
		}
	}

	onInputKeydown(event) {
		this.shadowRoot.querySelector('command-menu-list').hidden = false
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			// Two times to skip the first command, which is pre-selected.
			this.onArrowDown()
			this.onArrowDown()
		}
		if (event.key === 'Enter') {
			event.preventDefault()
			this.onEnter(this.filteredCommands[0])
		}
	}

	move(element) {
		element?.focus()
	}

	onEnter(command) {
		if (!command) command = this.shadowRoot.activeElement.item
		console.log('selected command', command)
		if (command?.children) {
			this.onArrowRight()
		} else if (this.hasAttribute('modal')) {
			this.close()
		}
		if (command?.action) command.action()
	}

	open() {
		this.shadowRoot.querySelector('dialog').showModal()
		this.removeAttribute('hidden')
		this.shadowRoot.querySelector('input[type=search]').focus()
	}

	close() {
		if (this.hasAttribute('modal')) this.setAttribute('hidden', true)
		this.showList = false
		this.shadowRoot.querySelector('input[type=search]').value = ''
		this.search = ''
		this.shadowRoot.querySelector('dialog').close()
	}

	toggle() {
		this.hasAttribute('hidden') ? this.open() : this.close()
	}

	onArrowRight() {
		const focused = this.shadowRoot.activeElement
		const children = focused.querySelector('command-menu-list')
		if (children) {
			children.hidden = false
			this.move(children.querySelector('command-menu-item'))
		}
	}

	onArrowLeft() {
		const focused = this.shadowRoot.activeElement
		const parent = focused.closest('command-menu-list')
		const isChild = parent.closest('command-menu-item')
		if (parent && isChild) {
			parent.hidden = true
			this.move(parent.parentElement)
		} else {
			this.move(this.shadowRoot.querySelector('input[type=search]'))
		}
	}

	onArrowUp() {
		const focused = this.shadowRoot.activeElement
		let previous = focused.previousElementSibling
		if (!previous) {
			const parent = focused.closest('command-menu-list')
			parent.hidden = true
			previous = parent.closest('command-menu-item')
		}
		if (!previous) {
			previous = this.shadowRoot.querySelector('input[type=search]')
		}
		this.move(previous)
	}

	onArrowDown() {
		const focused = this.shadowRoot.activeElement
		let next = focused.nextElementSibling
		if (!next && focused.type === 'search') {
			next = this.shadowRoot.querySelector('command-menu-item')
		}
		this.move(next)
	}

	render() {
		return html`
			<dialog>
				<command-menu-inner>
					<command-menu-input>
						<label>
							<input
								type="search"
								placeholder="Search for commands"
								autcomplete="off"
								spellcheck="false"
								@input=${(e) => (this.search = e.target.value)}
								@focus=${() => (this.showList = true)}
								@click=${() => (this.showList = true)}
								@keydown=${this.onInputKeydown}
							/>
						</label>
					</command-menu-input>
					<command-menu-list
						role="menu"
						?hidden=${!this.showList}
						@click=${this.onClick}
						@keydown=${this.onListKeydown}
					>
						${this.filteredCommands.map((item) => this.renderCommandMenuItem(item))}
					</command-menu-list>
				</command-menu-inner>
			</dialog>
		`
	}

	renderCommandMenuItem(item) {
		const {title, subtitle, shortcut, children} = item
		return html`
			<command-menu-item role="menuitem" tabIndex="0" .item=${item}>
				<command-menu-item-title>${title}</command-menu-item-title>
				<command-menu-item-subtitle>${subtitle}</command-menu-item-subtitle>
				${shortcut ? html`<kbd>${shortcut}</kbd>` : null} ${children ? html`&rarr;` : ''}
				${children?.length
					? html`
							<command-menu-list role="menu" hidden>
								${children.map((x) => this.renderCommandMenuItem(x))}
							</command-menu-list>
					  `
					: null}
			</command-menu-item>
		`
	}
}

customElements.define('command-menu', CommandMenu)

