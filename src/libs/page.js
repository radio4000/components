import {requestNavigate, requestRedirect} from './router-controller.js'

export default function page(target, options) {
	return requestNavigate(target, options)
}

page.redirect = function redirect(target) {
	return requestRedirect(target)
}
