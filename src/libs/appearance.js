// Each of these correspond to a matching css file in public/themes/.
export const THEMES = [
	'classic',
	// 'jellybeans', // disabled until it gets some love
	'minimal',
	'hash'
]

// We allow the user to choose their prefered appearance as well. It is up to the selected theme to implement.
export const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
export const COLOR_SCHEMES = ['os', 'light', 'dark']

// This determine the position of the player among other things.
export const UI_STATES = {
	// and we have a detail
	Close: 'close',
	Minimize: 'minimize',
	Dock: 'dock',
	Fullscreen: 'fullscreen',
}

/*
"detail" is "micro"
"close" is close
"mini" is displaying just the video
"dock" is docked to the side/bottom/top (full height or width)
"fullscreen" is full vh/vw/z-index
"close" is to "finish playback"
*/
