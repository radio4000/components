let controller

export function setRouterController(instance) {
	controller = instance
}

export function clearRouterController(instance) {
	if (controller === instance) {
		controller = undefined
	}
}

export function requestNavigate(target, options) {
	if (!controller) {
		let url
		if (typeof target === 'string') {
			url = target
		} else if (target && typeof target === 'object' && typeof target.toString === 'function') {
			url = target.toString()
		}
		if (url) {
			if (options?.replace) {
				window.location.replace(url)
			} else {
				window.location.assign(url)
			}
			return
		}
		return
	}
	return controller.navigate(target, options)
}

export function requestRedirect(target) {
	return requestNavigate(target, {replace: true})
}

export function requestState() {
	return controller?.getState?.()
}
