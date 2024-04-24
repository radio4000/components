/* This component is not imported in `./index.js` like the rest,
	 as it imports index.js to load all other components, and list them.
	 It is intended as a way to introduce and navigate all r4 components..
 */

const ComponentRoot = 'R4'

const camelToDash = (str) => {
	return str.replace(/([A-Z])/g, (val) => `-${val.toLowerCase()}`)
}

const slugFromName = (componentName) => {
	const camelName = componentName.split(ComponentRoot)[1]
	const dashName = camelToDash(camelName)
	return ComponentRoot.toLowerCase() + dashName
}

export default class R4Components extends HTMLElement {
	buildComponents(Components) {
		return Components
			.filter((exportClass) => {
				return exportClass.startsWith(ComponentRoot)
			})
			.map((componentName) => {
				const Component = Components[componentName]
				const config = {
					name: componentName,
					HTMLElement: Component,
					slug: slugFromName(componentName),
				}
				return config
			})
	}
	async connectedCallback() {
		// @todo find a different way to do this. It breaks build atm.
		// const {default: Components} = await import('./index.js')
		this.components = this.buildComponents(componentNames)
		if (this.components && this.components.length) {
			this.render()
		}
	}
	render() {
		const $menu = document.createElement('menu')
		this.components.forEach((component) => {
			const $li = document.createElement('li')
			$li.innerHTML = `
				<a href="/examples/${component.slug}/">${component.name}</a>
				<small><a href="${`https://github.com/radio4000/components/blob/main/src/components/${component.slug}.js`}">(source)</a></small>
			`
			$menu.append($li)
		})
		this.append($menu)
	}
}

const componentNames = [
	'R4Actions',
	'R4App',
	'R4AppMenu',
	'R4CommandMenu',
	'R4Avatar',
	'R4AvatarUpdate',
	'R4AvatarUpload',
	'R4AuthStatus',
	'R4ButtonPlay',
	'R4ButtonFollow',
	'R4Channel',
	'R4ChannelCard',
	'R4ChannelCreate',
	'R4ChannelDelete',
	'R4ChannelUpdate',
	'R4ChannelSearch',
	'R4Dialog',
	'R4EmailUpdate',
	'R4Favicon',
	'R4Layout',
	'R4Loading',
	'R4Player',
	'R4Map',
	'R4MapPosition',
	'R4PasswordReset',
	'R4PasswordUpdate',
	'R4Query',
	'R4Router',
	'R4SignIn',
	'R4SignOut',
	'R4SignUp',
	'R4Share',
	'R4SupabaseQuery',
	'R4SupabaseFilters',
	'R4SupabaseFilterSearch',
	'R4Title',
	'R4Track',
	'R4TrackCreate',
	'R4TrackDelete',
	'R4TrackUpdate',
	'R4TrackSearch',
	'R4Tuner',
	'R4User',
	'R4UserAccount',
	'R4UserDelete',
	'R4UserChannelsSelect',
	'R4Pagination',
	'R4Icon',
]
