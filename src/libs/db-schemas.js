/*
	 suapabse table data associated with each table
 */

const supabaseTables = {
	channels: {
		columns: ['created_at', 'updated_at', 'slug', 'name', 'description', 'coordinates', 'url', 'firebase', 'id', 'fts'],
		selects: ['*', 'id'],
	},
	tracks: {
		columns: [
			'created_at',
			'updated_at',
			'title',
			'description',
			'url',
			'discogs_url',
			'mentions',
			'tags',
			'id',
			'fts',
		],
		selects: ['*', 'id'],
	},
	channel_track: {
		junctions: [],
		columns: ['created_at', 'updated_at', 'user_id', 'channel_id', 'channel_id.slug', 'track_id'],
		selects: [],
	},
}
/* build the channel_track default select, from all "tracks" columns */
supabaseTables['channel_track'].selects.push(
	`channel_id!inner(slug),track_id!inner(${supabaseTables.tracks.columns.join(',')})`
)

/* build the channel_track "juction columns", from all "tracks" columns */
const channelTrackJuctionColumns = supabaseTables.tracks.columns.map((column) => `track_id.${column}`)
supabaseTables['channel_track'].junctions = channelTrackJuctionColumns

/* store the list of "tables", from the database tables */
export const supabaseTableNames = Object.keys(supabaseTables)

export default {
	tables: supabaseTables,
	tableNames: supabaseTableNames,
}
