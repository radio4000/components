import {sdk} from './sdk.js'

const {supabase} = sdk

const debug = false

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

/**
 * Browse a PostgreSQL database via Postgrest
 * @param {import('../components/r4-query.js').R4Query} props
 */
export async function browse(props) {
	const {table, select, filters, orderBy, order, page = 1, limit = 1} = props
	if (!table) throw new Error('missing "table" to browse')

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
		if (order) {
			const orderConfig = {ascending: order === 'asc'}
			query = query.order(orderBy, orderConfig)
		} else {
			query = query.order(orderBy)
		}
	}

	// And pagination.
	const {from, to, limit: l} = getBrowseParams({page, limit})
	query = query.range(from, to).limit(l)
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
	return {from, to, limit}
}
