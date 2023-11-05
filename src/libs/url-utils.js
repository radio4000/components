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
 * From a LitElement properties, and a data object,
	 will return a URLSearchParam ready to go into a URL.
	 Can be used to turn a web-component's output (dataObj),
	 into URLSearchParams (so element state is in the current URL)
*/
export function propertiesToSearch(elementProperties, dataObj) {
	console.log('properties to search', elementProperties, dataObj)
	const searchParams = new URLSearchParams(location.search)
	elementProperties.forEach((elementProperty) => {
		const paramValue = dataObj[elementProperty]
		const attributeType = typeof paramValue
		console.log(elementProperty, paramValue, attributeType)
		if (paramValue) {
			if (['object', 'array'].includes(attributeType)) {
				if (attributeType === 'Array' && paramValue.length === 0) return
				searchParams.set(elementProperty, JSON.stringify(paramValue))
			} else {
				searchParams.set(elementProperty, paramValue)
			}
		}
	})
	return searchParams
}

/**
 * Sets URL search params from a query object
 * @param {import("./query-page").R4Query} query - object with all the query params to be
 * @param {Array.<string>} excludeList - list of properties not to include in the URL
 */
export function setSearchParams(query, excludeList = []) {
	// const searchParams = propertiesToSearch(validParams, query)

	const searchParams = new URLSearchParams(location.search)
	for (const [key, value] of Object.entries(query)) {
		// Ensure the key is valid, and not exluded.
		if (!validQueryParams.includes(key) || excludeList.includes(key)) continue
		// handle arrays
		if (Array.isArray(value)) {
			console.log('handling array param:', key, value)
			if (value.length) {
				searchParams.set(key, JSON.stringify(value))
			} else {
				console.log('deleting', key)
				searchParams.delete(key)
			}
		} else {
			searchParams.set(key, value)
		}
	}

	console.log('set search params', searchParams.toString())
	// window.history.replaceState({}, '', searchParams.toString())
	const searchParamsString = `?${searchParams.toString()}`
	const search = decodeURIComponent(searchParamsString)
	window.history.replaceState(null, null, search)
}

/**
 * Remove entries from an object with empty values and empty arrays.
 * Useful to avoid setting empty strings "" or arrays [] in the URL
 * @param {object} obj
 */
function removeEmptyKeys(obj) {
	return Object.fromEntries(
		Object.entries(obj).filter(([, value]) => {
			if (Array.isArray(value)) return value.length
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
	propertiesToSearch,
	setSearchParams,
	removeEmptyKeys,
	getQueryFromUrl,
	createSearchFilter,
}
