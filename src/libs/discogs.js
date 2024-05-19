export const DISCOGS_URL = 'discogs.com'
export const DISCOGS_API_URL = 'api.discogs.com'
export const DiscogsResourceTypes = ['release', 'master']
export const DiscogsSearchResourceTypes = [...DiscogsResourceTypes, 'artist', 'label', 'all']

export const parseUrl = (url) => {
	const discogsUrl = new URL(url)
	if (discogsUrl.hostname.endsWith(DISCOGS_URL)) {
		const pathes = discogsUrl.pathname.slice(1).split('/')
		const type = pathes[0]
		const id = pathes[1].split('-')[0]
		if (DiscogsResourceTypes.includes(type)) {
			return {id, type}
		}
	}
}

const serializeInfo = (info) => {
	if (!info) {
		return ''
	}
	return info.toLowerCase().replace(' ', '-')
}

const serializeRelease = (release) => {
	let styles = []
	let allStyles = styles.concat(release.styles, release.genres).filter((elem, index, self) => {
		return index === self.indexOf(elem)
	})

	let result = {
		styles: allStyles.map(serializeInfo),
		labels: release.labels ? release.labels.map((i) => serializeInfo(i.name)) : [],
		country: release.country ? serializeInfo(release.country) : '',
		year: release.year,
	}
	return result
}

export const buildSearchUrl = (query, type) => {
	const ressourceType = DiscogsSearchResourceTypes.find((ressource) => ressource === type)
	const url = new URL(`search`, `https://${DISCOGS_URL}`)
	url.searchParams.set('q', query)
	type && url.searchParams.set('type', type)
	return url.href
}

const buildApiUrl = ({type, id}) => {
	/* add a "s" for the plural form of the ressource */
	return new URL(`${type}s/${id}`, `https://${DISCOGS_API_URL}`).href
}

export const fetchDiscogsInfo = async (parsedReleaseUrl) => {
	const data = await fetchDiscogs(parsedReleaseUrl)
	return serializeRelease(data)
}
export const fetchDiscogs = async ({id, type = DiscogsResourceTypes[0]}) => {
	let url = buildApiUrl({type, id})
	let response = await fetch(url)
	let data = await response.json()
	if (data.errors) {
		throw new Error(data.errors)
	}
	return data
}
