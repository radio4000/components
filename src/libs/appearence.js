const THEMES = ['jellybeans', 'minimal', 'default', 'classic']
const COLOR_SCHEMES = ['os', 'light', 'dark']
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

export {THEMES, COLOR_SCHEMES, prefersDark}
