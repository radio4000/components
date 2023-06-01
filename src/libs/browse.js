import {sdk} from '@radio4000/sdk'

const {supabase} = sdk

/*
	 all known supabase query filter operators

	 Warning: these are appended, and executed,
	 to supabase's js sdk "select()" method, as functions
 */
export const supabaseOperatorsTable = {
	eq: {},
	neq: {},
	gt: {},
	gte: {},
	lt: {},
	lte: {},
	like: {},
	ilike: {},
	is: {},
	in: {},
	contains: {},
	containedBy: {},
	rangeGt: {},
	rangeGte: {},
	rangeLt: {},
	rangeLte: {},
	rangeAdjacent: {},
	overlaps: {},
	textSearch: {
		config: {
			type: 'websearch',
			config: 'english',
		},
	},
	match: {},
	not: {},
	or: {},
	filter: {},
}

export const supabaseOperators = Object.keys(supabaseOperatorsTable)

/* browse the list (of db table) like it is paginated;
	 (query params ->) components-attributes -> supbase-query
	 this does not render the list, just browses it
 */
export async function query({
	page = 1,
	limit = 1,
	table = '',
	select = '',
	orderBy = '',
	orderConfig = {},
	filters = [],
}) {
	console.log('browse query', {orderBy, orderConfig, filters})

	let query = supabase.from(table).select(select)

	/*
		 add filters to the query,
		 but first, only keep those with "known supabase oprators";
		 Security: we don't want `supabse.sdk.select().[operator]()`,
		 to execute "anything"the user might inject in the interface;
		 - the "filter.value" always is a string, from the related `input`
		 we convert it here to the right type the sdk filter expects
	 */
	filters
		.filter((filter) => {
			return supabaseOperators.includes(filter.operator)
		})
		.forEach((filter) => {
			console.log('filter', filter)

			/* "filter" operator is a supabase.sdk "escape hatch",
											aplying the filter raw; see docs
											(WARNING) otherwise the (raw string) operator is the supabase sdk function invoqued
										*/
			if (filter.operator === 'filter') {
				query = query.filter(filter.operator, filter.column, filter.value || null)
			} else if (['contains', 'containedBy'].includes(filter.operator)) {
				/* handle each type of supabase/postresql filter */
				let valueJson
				try {
					valueJson = JSON.parse(filter.value)
				} catch (e) {
					// console.log(e)
				}
				query = query[filter.operator](filter.column, valueJson || [filter.value.split(',')] || null)
			} else {
				query = query[filter.operator](filter.column, filter.value || null)
			}
		})

	// After filters we add sorting.
	console.log('sorting', orderBy, orderConfig)
	query = query.order(orderBy, orderConfig)

	// And pagination.
	const {from, to, limitResults} = getBrowseParams({page, limit})
	console.log('pagination', {page, from, to, limit, limitResults})
	query = query.range(from, to).limit(limitResults)

	console.log('final query', query.url.href)

	return query
}

/*
	 converts web component attributes, to supabase sdk query parameters:
	 -> page="1" limit="1"
	 -> from[0] to to[0] limit[0]
 */
function getBrowseParams({page, limit}) {
	let from, to, limitResults
	from = (page - 1) * limit
	to = from + limit - 1
	limitResults = limit - 1
	return {from, to, limitResults}
}