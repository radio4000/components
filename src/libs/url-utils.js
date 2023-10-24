import R4SupabaseQuery from '../components/r4-supabase-query'

const R4_QUERY_ATTR = ['page', 'limit', 'count', 'table', 'select', 'filters', 'orderBy', 'orderConfig']

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
export function updateSearchParams(query, excludeList = []) {
	const props = R4_QUERY_ATTR.filter((name) => !excludeList.includes(name))
	if (props?.length) {
		const searchParams = propertiesToSearch(props, query)
		const searchParamsString = `?${searchParams.toString()}`
		const search = decodeURIComponent(searchParamsString)
		window.history.replaceState(null, null, search)
	} else {
		window.history.replaceState(null, null, '')
	}
}

export default {
	propertiesToSearch,
	propertiesFromSearch,
	updateSearchParams,
}
