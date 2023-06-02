import R4SupabaseQuery from '../components/r4-supabase-query'

/*
	 this file are utilities to manipulate URL, and URLSearchParams;
	 because of how things are witter in code:
	 - web-components attributes are dashed-case
	 - web-components properties are camelCase
	 - url search params are used to store properties values in URL,
	 and retrieve them to be set as attributes on the components
 */

/*
	 Get LitElement.properties that can go to URLSearchParams
	 if `ElementClass.properties[name].searchParam === true`
	 will return a config object for each of the Element's property
 */
export function getElementProperties(ElementClass) {
	if (!ElementClass || !ElementClass.properties) return
	const elementProperties = Object.entries(ElementClass.properties)
		.map(([propertyName, propertyConfig]) => {
			const propertyAttribute = propertyConfig.attribute || propertyName
			return {
				name: propertyName,
				attribute: propertyAttribute,
				attributeType: propertyConfig.type.name,
				searchParam: propertyConfig.searchParam ? propertyAttribute : null,
				value: null,
			}
		})
		.filter((property) => property.searchParam)
	return elementProperties
}

/* From a LitElement properties, and a data object,
	 will return a URLSearchParam ready to go into a URL.
	 Can be used to turn a web-component's output (dataObj),
	 into URLSearchParams (so element state is in the current URL) */
export function propertiesToSearch(elementProperties, dataObj) {
	const searchParams = new URLSearchParams()
	elementProperties.forEach((elementProperty) => {
		const {name, searchParam, attributeType} = elementProperty
		const paramValue = dataObj[name]
		if (paramValue) {
			if (['Object', 'Array'].includes(attributeType)) {
				searchParams.set(searchParam, JSON.stringify(paramValue))
			} else {
				searchParams.set(searchParam, paramValue)
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
				} catch (e) {}
				elementProperty.value = jsonValue
			} else {
				elementProperty.value = searchParams.get(searchParam)
			}
		}
		return elementProperty
	})
}

// Sets URL search params from a query object
export function updateSearchParams(query, excludeList = []) {
	const props = getElementProperties(R4SupabaseQuery).filter(({name}) => !excludeList.includes(name))
	const searchParams = propertiesToSearch(props, query)
	const searchParamsString = `?${searchParams.toString()}`
	window.history.replaceState(null, null, searchParamsString)
}

export default {
	getElementProperties,
	propertiesToSearch,
	propertiesFromSearch,
	updateSearchParams
}
