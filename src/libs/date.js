export function formatDate(dateStr) {
	const date = new Date(dateStr)
	const formatter = new Intl.DateTimeFormat('de', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		// hour: 'numeric',
		// minute: 'numeric',
		// second: 'numeric',
		// timeZoneName: 'short',
	})
	const formattedDate = formatter.format(date)
	return formattedDate
}
