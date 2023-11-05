// Params we allow in the URL.
const R4_QUERY_PARAMS = [
	'table',
	'select',
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
 * It will only set params in the `includeList` list.
 * It won't set params in the `excludeList` list.
 * @param {import("../pages/base-query").R4Query} query - object with all the query params to be
 * @param {{includeList?: String[], excludeList?: String[]}} [options]
 */
export function setSearchParams(query, options = {}) {
	const searchParams = new URLSearchParams(location.search)
	const includeList = options.includeList || R4_QUERY_PARAMS
	const excludeList = options.excludeList || ['table', 'select']

	for (const [key, value] of Object.entries(query)) {
		// Ensure the key is valid, and not exluded.
		if (!includeList.includes(key) || excludeList.includes(key)) continue

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
