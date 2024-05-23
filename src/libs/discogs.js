export const DISCOGS_URL = 'discogs.com'
export const DISCOGS_API_URL = 'api.discogs.com'
export const DiscogsResourceTypes = ['release', 'master']
export const DiscogsSearchResourceTypes = [...DiscogsResourceTypes, 'artist', 'label', 'all']

/* fetch a discogs release/master from the API */
export const fetchDiscogs = async ({id, type = DiscogsResourceTypes[0]}) => {
	let url = buildApiUrl({type, id})
	let response = await fetch(url)
	let data = await response.json()
	if (data.errors) {
		throw new Error(data.errors)
	}
	return data
}

/* builds the URL to get a resource from the API  */
const buildApiUrl = ({type, id}) => {
	/* add a "s" for the plural form of the ressource */
	return new URL(`${type}s/${id}`, `https://${DISCOGS_API_URL}`).href
}

/* parses a discogs release URL;
	 Ex:
	 - https://www.discogs.com/release/13304754-%EB%B0%95%ED%98%9C%EC%A7%84-Park-Hye-Jin-If-U-Want-It (new)
	 - https://www.discogs.com/Diego-The-Persuasion-Channel/release/17335 (legacy)
 */
export const parseUrl = (url) => {
	const discogsUrl = new URL(url)
	if (discogsUrl.hostname.endsWith(DISCOGS_URL)) {
		const pathes = discogsUrl.pathname.slice(1).split('/')
		const type = [pathes[0], pathes[1]].find((typeInPath) => {
			return DiscogsResourceTypes.includes(typeInPath)
		})
		if (type) {
			const typeInPathIndex = pathes.indexOf(type)
			const id = pathes.slice(typeInPathIndex + 1)[0].split('-')[0]
			return {id, type}
		}
	}
}

export const extractSuggestions = ({year = 0, genres = [], styles = [], labels = []}) => {
	const labelNames = labels?.map(({name}) => name)
	return [...genres, ...styles, year, ...labelNames]
		.filter((s) => !!s)
		.map((suggestion) => {
			return suggestion.toString().replace(' ', '-').toLowerCase()
		})
}

const serializeInfo = (info) => {
	return info?.replace(' ', '-').toLowerCase()
}

export const buildSearchUrl = (query, type) => {
	const ressourceType = DiscogsSearchResourceTypes.find((ressource) => ressource === type)
	const url = new URL(`search`, `https://${DISCOGS_URL}`)
	url.searchParams.set('q', query)
	type && url.searchParams.set('type', type)
	return url.href
}

export const resourceToChannel = (resource) => {
	return {
		name: resource.title,
		slug: `r4-discogs-${resource.id}`,
	}
}
export const resourceTrackToR4Track = (resourceTrack, resource) => {
	const video = resource.videos.find((video) => {
		const videoTitle = video.title.toLowerCase().trim()
		return videoTitle.indexOf(resourceTrack.title.toLowerCase().trim()) > -1
	})
	return {
		title: resourceTrack.title,
		url: video?.uri,
		discogs_url: resource.uri,
	}
}
