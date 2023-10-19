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
export async function browse({
	page = 1,
	limit = 1,
	table = '',
	select = '',
	orderBy = '',
	orderConfig = {},
	filters = [],
}) {
	// We add count exact: to get a .total property back in the response. head:false ensures we still get the rows.
	let query = supabase.from(table).select(select, {
		count: 'exact',
		head: false,
	})

	/*
		 add filters to the query,
		 but first, only keep those with "known supabase oprators";
		 Security: we don't want `supabse.sdk.select().[operator]()`,
		 to execute "anything"the user might inject in the interface;
		 - the "filter.value" always is a string, from the related `input`
		 we convert it here to the right type the sdk filter expects
	 */
	filters?.length &&
		filters
			.filter((filter) => filter.value && supabaseOperators.includes(filter.operator))
			.forEach((filter) => {
				/* "filter" operator is a supabase.sdk "escape hatch",
				aplying the filter raw; see docs
				(WARNING) otherwise the (raw string) operator is the supabase sdk function invoqued
			*/
				if (filter.operator === 'filter') {
					query = query.filter(filter.operator, filter.column, filter.value || null)
				} else if (['contains', 'containedBy'].includes(filter.operator)) {
					/* handle each type of supabase/postresql filter */
					let valueJson
					// If the value is a number, like 1979, we don't want to parse.
					if (Number.isNaN(filter.value)) {
						try {
							valueJson = JSON.parse(filter.value)
						} catch (e) {
							//
						}
					}
					const val = valueJson || [filter.value.split(',')] || null
					query = query[filter.operator](filter.column, val)
				} else {
					query = query[filter.operator](filter.column, filter.value || null)
				}
			})

	// After filters we add sorting.
	if (orderBy) {
		if (orderConfig) {
			query = query.order(orderBy, orderConfig)
		} else {
			query = query.order(orderBy)
		}
	}

	// And pagination.
	const {from, to, limit: l} = getBrowseParams({page, limit})
	query = query.range(from, to).limit(l)

	/* console.info('browse.query', query.url.search) */

	return query
}

/*
	 converts web component attributes, to supabase sdk query parameters:
	 -> page="1" limit="1"
	 -> from[0] to to[0] limit[0]
 */
export function getBrowseParams({page, limit}) {
	const from = (page - 1) * limit
	const to = from + limit - 1
	const params = {from, to, limit}
	return params
}
