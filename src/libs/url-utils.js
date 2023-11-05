// Params we want in the URL.
const validQueryParams = [
	// 'table',
	// 'select',
	'page',
	'limit',
	'search',
	'filter',
	'filters',
	'orderBy',
	'order',
	//'orderConfig',
]

/**
 * Sets URL search params from a query object
 * @param {import("./query-page").R4Query} query - object with all the query params to be
 * @param {Array.<string>} excludeList - list of properties not to include in the URL
 */
export function setSearchParams(query, excludeList = []) {
	const searchParams = new URLSearchParams(location.search)
	for (const [key, value] of Object.entries(query)) {
		// Ensure the key is valid, and not exluded.
		if (!validQueryParams.includes(key) || excludeList.includes(key)) continue

		if (Array.isArray(value)) {
			// If non-empty array, stringify and set
			if (value.length) {
				searchParams.set(key, JSON.stringify(value))
			} else {
				// if empty, remove from url
				searchParams.delete(key)
			}
		} else {
			// strings and numbers can just be set
			searchParams.set(key, value)
		}
	}
	const searchParamsString = `?${searchParams.toString()}`
	const search = decodeURIComponent(searchParamsString)
	window.history.replaceState(null, null, search)
	console.log('searchParams', search)
}

/**
 * Remove entries from an object with empty values and empty arrays.
 * Useful to avoid setting empty strings "" or arrays [] in the URL
 * @param {object} obj
 */
function removeEmptyKeys(obj) {
	return Object.fromEntries(
		Object.entries(obj).filter(([, value]) => {
			// if (Array.isArray(value)) return value.length
			return !!value
		})
	)
}

// Create a `R4Query` from URLSearchParams.
export function getQueryFromUrl(searchParams) {
	return removeEmptyKeys({
		search: searchParams.get('search'),
		orderBy: searchParams.get('orderBy'),
		order: searchParams.get('order'),
		page: searchParams.get('page'),
		limit: searchParams.get('limit'),
		// Either as ?filter={}&filter={}
		// filters: searchParams.getAll('filter').map(x => JSON.parse(x)),
		// ... or filters=[{}, {}]
		filters: JSON.parse(searchParams.get('filters'))
	})
}

export function createSearchFilter(search) {
	return {
		column: 'fts',
		operator: 'textSearch',
		value: `'${search}':*`,
	}
}

// extractSearchFilterValue(filter) {
// 	const search = filter?.value.split(':')[0].split("'")[1]
// 	return search
// }

export default {
	setSearchParams,
	removeEmptyKeys,
	getQueryFromUrl,
	createSearchFilter,
}
