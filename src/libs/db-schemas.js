/* Supabase table data */
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
		columns: [
			'created_at',
			'updated_at',
			'user_id',
			'channel_id',
			'channel_id.slug',
			'track_id',
			'track_id.created_at',
		],
		selects: ['channel_id!inner(slug),track_id!inner(*)'],
	},

	/* a postgresql view */
	channel_tracks: {
		columns: [],
		selects: ['*'],
	},
}

// Copy the track columns to the channel_track junctions  and channel_tracks view
supabaseTables['channel_track'].junctions = supabaseTables.tracks.columns.map((column) => `track_id.${column}`)
supabaseTables['channel_tracks'].columns = supabaseTables.tracks.columns
supabaseTables['channel_tracks'].columns.push('slug')

/* store the list of "tables", from the database tables */
export const supabaseTableNames = Object.keys(supabaseTables)

export default {
	tables: supabaseTables,
	tableNames: supabaseTableNames,
}
