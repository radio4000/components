const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const THEMES = ['classic', 'jellybeans', 'minimal', 'hash']
const COLOR_SCHEMES = ['os', 'light', 'dark']
const UI_STATES = {
	Close: 'close',
	Dock: 'dock',
	Minimize: 'minimize',
	Fullscreen: 'fullscreen',
}

export {UI_STATES, THEMES, COLOR_SCHEMES, prefersDark}
