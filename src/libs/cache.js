export default class Cache {
	constructor() {
		this.data = new Map()
	}

	async get(key, fetcher, ttl = 60000) {
		const now = Date.now()
		if (!this.data.has(key)) {
			// If the key is not in the cache, fetch it and store the Promise.
			return this.refresh(key, fetcher, ttl)
		} else {
			const {timestamp, dataPromise} = this.data.get(key)
			// If the key is in the cache, but it is expired, refresh it in the background.
			if (now - timestamp > ttl) {
				this.refresh(key, fetcher, ttl)
			}
			// If the key is in the cache and it is not expired, return the cached data.
			console.log('using cache', key, ttl)
			return dataPromise
		}
	}

	async refresh(key, fetcher, ttl) {
		console.log('cache refresh', key, ttl)
		const dataPromise = fetcher().catch((err) => {
			// If an error occurs, remove the Promise from the cache.
			this.data.delete(key)
			throw err
		})
		this.data.set(key, {dataPromise, timestamp: Date.now()})
		return dataPromise
	}
}
