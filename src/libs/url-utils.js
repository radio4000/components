const R4_QUERY_ATTR = ['table', 'select', 'page', 'limit', 'count', 'filters', 'orderBy', 'order' /*'orderConfig'*/]

/**
 * @typedef {object} URLQuery
 * @prop {Array} filters
 * @prop {string} orderBy
 * @prop {string} order
 * @prop {string} page
 * @prop {string} limit

/* From a LitElement properties, and a data object,
	 will return a URLSearchParam ready to go into a URL.
	 Can be used to turn a web-component's output (dataObj),
	 into URLSearchParams (so element state is in the current URL) */
export function propertiesToSearch(elementProperties, dataObj) {
	const searchParams = new URLSearchParams()
	elementProperties.forEach((elementProperty) => {
		const paramValue = dataObj[elementProperty]
		if (paramValue) {
			const attributeType = typeof paramValue
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

/* Retrieves a web-component's (initial) attributes' values,
   from the current browser URL, using the elementProperties as mapping */
export function propertiesFromSearch(elementProperties) {
	const searchParams = new URLSearchParams(window.location.search)
	return elementProperties.map((elementProperty) => {
		const {searchParam} = elementProperty
		if (searchParams.has(searchParam)) {
			if (['Object', 'Array'].includes(elementProperty.attributeType)) {
				let jsonValue
				try {
					jsonValue = JSON.parse(searchParams.get(searchParam))
				} catch (e) {
					//
				}
				elementProperty.value = jsonValue
			} else {
				elementProperty.value = searchParams.get(searchParam)
			}
		}
		return elementProperty
	})
}

/**
 * @typedef {object} R4Query
 * @prop {string} [select] - sql query to select columns
 * @prop {string} [table] - table name
 * @prop {Array.<R4Filter>} [filters] - array of filters
 * @prop {string} [orderBy] - column name to order by
 * @prop {{ascending: boolean}} [orderConfig]
 * @prop {number} [page] - page number
 * @prop {number} [limit] - items per page
 */

/**
 * @typedef {object} R4Filter
 * @prop {string} column - column name
 * @prop {string} operator - operator
 * @prop {string} value - value
 */

/**
 * Sets URL search params from a query object
 * @param {R4Query} query - object with all the query params to be
 * @param {Array.<string>} excludeList - list of properties not to include in the URL
 */
export function setSearchParams(query, excludeList = []) {
	const props = R4_QUERY_ATTR.filter((name) => !excludeList.includes(name))
	console.log('setSearchParams', query)
	if (props?.length) {
		const searchParams = propertiesToSearch(props, query)
		const searchParamsString = `?${searchParams.toString()}`
		const search = decodeURIComponent(searchParamsString)
		window.history.replaceState(null, null, search)
	} else {
		window.history.replaceState(null, null, '')
	}
}

/**
 * Remove keys with empty values and arrays
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

// Collect relevant params from the URLSearchParams.
function getQueryFromUrl(searchParams) {
	return removeEmptyKeys({
		filters: searchParams.getAll('filter'),
		orderBy: searchParams.get('orderBy'),
		order: searchParams.get('order'),
		page: searchParams.get('page'),
		limit: searchParams.get('limit'),
	})
}

export default {
	propertiesToSearch,
	propertiesFromSearch,
	setSearchParams,
	removeEmptyKeys,
	getQueryFromUrl,
}
