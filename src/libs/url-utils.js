/* this file are utilities to manipulate URL, and URLSearchParams */

function getElementProperties(elementClass) {
	if (!elementClass || !elementClass.properties) return
	const elementProperties = Object.entries(elementClass.properties)
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

function propertiesToSearch(elementProperties, dataObj) {
	const searchParams = new URLSearchParams()
	elementProperties.forEach((elementProperty) => {
		const {name, attribute, searchParam, value, attributeType} = elementProperty
		const paramValue = dataObj[searchParam]
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

function propertiesFromSearch(elementProperties) {
	const searchParams = new URLSearchParams(window.location.search)
	return elementProperties.map((elementProperty) => {
		const {name, attribute, value, searchParam} = elementProperty
		if (searchParams.has(searchParam)) {
			elementProperty.value = searchParams.get(searchParam)
		}
		return elementProperty
	})
}

export default {
	getElementProperties,
	propertiesToSearch,
	propertiesFromSearch,
}
