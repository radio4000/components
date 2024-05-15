const linkEntitiesRegex = /(^|\s)([#@][a-z\d-]+)/gi

/**
 * Finds #hashtags and @mentions inside a string and turn them into HTML links for R4
 * @param {string} str - the string to parse
 * @param {string} href - URL where the app is running
 * @param {string} origin - URL to tracks page
 * @returns {string} with hashtags and mentions linked
 */
export function linkEntities(str, href, origin) {
	if (!origin) return str
	return str.replace(linkEntitiesRegex, (match, prefix, entity) => {
		const type = entity.startsWith('#') ? 'hashtag' : 'mention'
		let url = `${origin}?search=${entity.substring(1)}`
		if (type === 'mention') {
			url = `${href}/${entity.substring(1)}`
		}
		return `<a href="${url}">${entity}</a>`
	})
}
