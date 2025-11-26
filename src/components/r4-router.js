import {LitElement} from 'lit'
import {html, literal, unsafeStatic} from 'lit/static-html.js'
import {setRouterController, clearRouterController} from '../libs/router-controller.js'

/**
All routes are passed the following props:
- `store` - the global store
- `config` - the config object
- `params` - dynamic params of the current URL, as defined on the route
- `searchParams` - a URLSearchParams object from the current url
*/

// RouterManager module-level state
let routers = new Set()
let initialized = false
let basePath = ''

function handlePopState() {
	const state = getState()
	broadcast(state)
	for (const router of routers) {
		router.onNavigate(state)
	}
}

function handleClick(event) {
	if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
		return
	}
	let target = event.composedPath?.()[0] || event.target
	if (!target || !(target instanceof Node)) return
	if (!(target instanceof HTMLAnchorElement)) {
		target = target.closest?.('a')
	}
	if (!(target instanceof HTMLAnchorElement)) return
	if (target.target && target.target !== '_self') return
	if (target.hasAttribute('download') || target.getAttribute('rel') === 'external') return
	const href = target.href
	if (!href) return
	let url
	try {
		url = new URL(href, window.location.href)
	} catch {
		return
	}
	if (url.origin !== window.location.origin) return
	const fullPath = url.pathname + url.search + url.hash
	const currentFull = window.location.pathname + window.location.search + window.location.hash
	if (fullPath === currentFull) return
	event.preventDefault()
	navigate(fullPath)
}

function init(config) {
	if (initialized) return
	basePath = computeBasePath(config)
	window.addEventListener('popstate', handlePopState)
	document.addEventListener('click', handleClick)
	setRouterController({getState, navigate, redirect})
	initialized = true
}

function register(router) {
	init(router.config)
	routers.add(router)
	router.onNavigate(getState())
}

function unregister(router) {
	routers.delete(router)
	if (!routers.size && initialized) {
		window.removeEventListener('popstate', handlePopState)
		document.removeEventListener('click', handleClick)
		clearRouterController({getState, navigate, redirect})
		initialized = false
	}
}

function resync(router) {
	if (!initialized || !routers.has(router)) return
	router.onNavigate(getState())
}

function getState() {
	const {pathname, search, hash} = window.location
	const trimmed = trimBase(pathname)
	return {
		path: normalizeRelativePath(trimmed),
		fullPath: pathname,
		search,
		hash,
		url: window.location.origin + pathname + search + hash,
		searchParams: new URLSearchParams(search),
	}
}

function trimBase(pathname) {
	if (!basePath) return pathname
	if (pathname === basePath) return '/'
	if (pathname.startsWith(basePath + '/')) return pathname.slice(basePath.length)
	return pathname
}

function applyBase(path) {
	if (!basePath || basePath === '/') return path
	const normalized = path.startsWith('/') ? path : '/' + path
	if (normalized === basePath || normalized.startsWith(basePath + '/')) {
		return normalized
	}
	return normalizeFullPath(basePath + normalized)
}

function navigate(target, options = {}) {
	const url = resolve(target)
	if (options.replace) {
		history.replaceState({}, '', url)
	} else {
		history.pushState({}, '', url)
	}
	handlePopState()
}

function redirect(to) {
	if (typeof to === 'string') {
		navigate(to, {replace: true})
	}
}

function broadcast(state) {
	window.dispatchEvent(new CustomEvent('r4:location-changed', {detail: state}))
}

function resolve(target) {
	if (!target) {
		return applyBase('/')
	}
	let url
	try {
		url = new URL(target, window.location.origin)
	} catch {
		const candidate = target.startsWith('/') ? target : '/' + target
		url = new URL(candidate, window.location.origin)
	}
	const fullPath = url.pathname + url.search + url.hash
	return applyBase(fullPath)
}

const ROUTER_MANAGER = {register, unregister, resync}

export default class R4Router extends LitElement {
	static properties = {
		store: {type: Object, state: true},
		config: {type: Object, state: true},
		routes: {type: Array, state: true},
		prefix: {type: String},
		params: {type: Object, state: true},
		searchParams: {type: Object, state: true},
	}

	constructor() {
		super()
		this.params = {}
		this.searchParams = new URLSearchParams()
		this.componentName = undefined
		this._compiled = []
		this._order = 0
		this._splatIndex = 0
	}

	connectedCallback() {
		this.setupRoutes()
		ROUTER_MANAGER.register(this)
		super.connectedCallback()
	}

	disconnectedCallback() {
		ROUTER_MANAGER.unregister(this)
		super.disconnectedCallback()
	}

	updated(changedProps) {
		if (changedProps.has('routes') || changedProps.has('prefix')) {
			this.setupRoutes()
			ROUTER_MANAGER.resync(this)
		}
	}

	setupRoutes() {
		const routes = Array.isArray(this.routes) ? this.routes : []
		const prefixPath = this.prefix ? normalizeFullPath(this.prefix) : ''
		const baseDescriptors = this.prefix ? parseParamDescriptors(this.prefix) : []
		const baseDescriptorMap = new Map()
		for (const desc of baseDescriptors) {
			baseDescriptorMap.set(desc.safe, desc)
		}
		this._compiled = []
		this._order = 0
		this._splatIndex = 0
		for (const route of routes) {
			const compiled = this.compileRoute(route, prefixPath, baseDescriptorMap)
			if (compiled) this._compiled.push(compiled)
		}
		this._compiled.sort((a, b) => {
			if (b.depth !== a.depth) return b.depth - a.depth
			if (b.fullPath.length !== a.fullPath.length) return b.fullPath.length - a.fullPath.length
			return a.order - b.order
		})
	}

	compileRoute(route, prefixPath, baseDescriptorMap) {
		if (!route || typeof route !== 'object') return null
		const routePath = typeof route.path === 'string' ? route.path : '/'
		const fullPath = normalizeFullPath(joinPaths(prefixPath, routePath))
		const sanitized = sanitizePathForPattern(fullPath, this)
		let pattern
		try {
			pattern = new URLPattern({pathname: sanitized})
		} catch (error) {
			console.error('Failed to compile route pattern', fullPath, error)
			return null
		}
		const descriptorMap = new Map(baseDescriptorMap)
		const ownDescriptors = parseParamDescriptors(routePath)
		for (const desc of ownDescriptors) {
			descriptorMap.set(desc.safe, desc)
		}
		return {
			route,
			pattern,
			fullPath,
			descriptors: Array.from(descriptorMap.values()),
			order: this._order++,
			depth: fullPath.split('/').filter(Boolean).length,
		}
	}

	onNavigate(state) {
		this.searchParams = new URLSearchParams(state.searchParams)
		if (!this._compiled.length) {
			this.clearRoute()
			return
		}
		const path = state.path
		let matched = null
		for (const compiled of this._compiled) {
			let result
			try {
				result = compiled.pattern.exec({pathname: path})
			} catch {
				result = undefined
			}
			if (result) {
				matched = {compiled, result}
				break
			}
		}
		if (matched) {
			this.activateRoute(matched.compiled, matched.result.pathname?.groups || {})
		} else {
			this.clearRoute()
		}
	}

	activateRoute(compiled, groups) {
		const params = extractParams(compiled.descriptors, groups)
		this.params = params
		const page = compiled.route.page
		this.componentName = page ? `r4-page-${page}` : undefined
		this.requestUpdate()
	}

	clearRoute() {
		this.componentName = undefined
		this.params = {}
		this.requestUpdate()
	}

	render() {
		if (!this.componentName) return
		const tag = literal`${unsafeStatic(this.componentName)}`
		// eslint-disable-next-line lit/binding-positions, lit/no-invalid-html
		return html`<${tag} .store=${this.store} .config=${this.config} .params=${this.params} .searchParams=${this.searchParams}></${tag}>`
	}

	createRenderRoot() {
		return this
	}
}

function computeBasePath(config) {
	const href = config?.href
	if (!href) return ''
	try {
		const url = new URL(href, window.location.href)
		return normalizeBasePath(url.pathname)
	} catch {
		return ''
	}
}

function normalizePath(path, emptyAsRoot = true) {
	if (!path || path === '/') return emptyAsRoot ? '/' : ''
	let normalized = path
	if (!normalized.startsWith('/')) normalized = '/' + normalized
	normalized = normalized.replace(/\/+/g, '/')
	if (normalized.length > 1 && normalized.endsWith('/')) {
		normalized = normalized.slice(0, -1)
	}
	return normalized || (emptyAsRoot ? '/' : '')
}

const normalizeBasePath = (path) => normalizePath(path, false)
const normalizeRelativePath = (path) => normalizePath(path, true)
const normalizeFullPath = (path) => normalizePath(path, true)

function joinPaths(base, addition) {
	if (!base) return normalizeFullPath(addition || '/')
	if (!addition || addition === '/') return normalizeFullPath(base)
	const baseNormalized = normalizeFullPath(base)
	if (addition.startsWith('/')) {
		return normalizeFullPath(baseNormalized + addition)
	}
	return normalizeFullPath(baseNormalized + '/' + addition)
}

function sanitizeParamName(name) {
	return name.replace(/[^A-Za-z0-9_]/g, '_')
}

function parseParamDescriptors(path) {
	if (typeof path !== 'string' || !path) return []
	const matches = []
	const pattern = /:([A-Za-z0-9_-]+)/g
	let result
	while ((result = pattern.exec(path))) {
		const original = result[1]
		matches.push({original, safe: sanitizeParamName(original)})
	}
	return matches
}

function sanitizePathForPattern(path, router) {
	let sanitized = path || '/'
	sanitized = sanitized.replace(/:([A-Za-z0-9_-]+)/g, (_match, name) => `:${sanitizeParamName(name)}`)
	sanitized = sanitized.replace(/\*/g, () => `:__splat${++router._splatIndex}*`)
	return sanitized
}

function extractParams(descriptors, groups) {
	const params = {}
	for (const descriptor of descriptors) {
		const value = groups?.[descriptor.safe]
		if (value !== undefined) {
			params[descriptor.original] = value
		}
	}
	return params
}
