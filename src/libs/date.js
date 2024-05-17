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

export function substractDays(dateString, days = 0) {
	const date = new Date(dateString)
	date.setDate(date.getDate() - days)
	return date
}

// Check if the date is fresher than 1 month
export function isFreshDate(updatedAt) {
	const trackDate = new Date(updatedAt)
	const today = new Date()

	// Calculate the date one month ago
	const oneMonthAgo = new Date(today)
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

	// Check if the track was updated within the last month
	return trackDate >= oneMonthAgo && trackDate <= today
}

export function relativeDate(dateString) {
	const date = new Date(dateString)
	const today = new Date()
	const diffTime = Math.abs(today - date)
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
	return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

export function relativeDateSolar(dateString) {
	const date = new Date(dateString)
	const today = new Date()

	const diffTime = Math.abs(today - date)
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

	const years = Math.floor(diffDays / 365)
	const remainingDays = diffDays % 365

	const yearsString = years ? `${years} sun orbit${years > 1 ? 's' : ''}` : ''
	const andString = years && remainingDays ? ', ' : ''
	const daysString = `${remainingDays} earth rotation${remainingDays > 1 ? 's' : ''}`

	return `${yearsString}${andString}${daysString}`
}
