import {sdk} from '../libs/sdk.js'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="email">Email</label>
			<input name="email" type="email" autocomplete="username" required placeholder="user@example.com"/>
		</fieldset>
		<fieldset>
			<label for="password">Password</label>
			<input name="password" type="password" autocomplete="current-password" required placeholder="my-private-password"/>
		</fieldset>
	</slot>
`

const captchaFieldTemplate = document.createElement('template')
captchaFieldTemplate.innerHTML = `
	<fieldset>
		<legend>To prevent spam, please solve this captcha.</legend>
		<input name="token" type="radio" disabled required placeholder="R4_USED_BY_ONVERIFIED"></input>
		<label for="token">
			<h-captcha
				site-key="R4_SET_BY_INIT_CAPTCHA"
				size="normal"
				color-
				tabindex="0"></h-captcha>
		</label>
	</fieldset>
`

export default class R4SignIn extends R4Form {
	submitText = 'Sign in'

	constructor() {
		super()
		this.fieldsTemplate = fieldsTemplate
	}

	errors = {
		default: {
			message: 'Unhandled error',
		},
		'email-not-confirmed': {
			field: 'email',
			message: 'Email must be confirmed to login (check your inbox)',
		},
		'invalid-login-credentials': {
			field: 'email',
			message: 'The Email & Password combination is incorect',
		},
		'captcha-required': {
			message: 'The Captcha is missing. Please solve it to sign in.',
		},
	}
	connectedCallback() {
		super.connectedCallback()
		const siteKey = this.getAttribute('hcaptcha-site-key')
		if (siteKey) {
			this.initCaptcha(siteKey)
		}
	}
	initCaptcha(siteKey) {
		const $signupCaptchaField = captchaFieldTemplate.content.cloneNode(true)
		const $captchaInput = $signupCaptchaField.querySelector('input')
		const $signupCaptcha = $signupCaptchaField.querySelector('h-captcha')
		$signupCaptcha.setAttribute('site-key', siteKey)
		$signupCaptcha.addEventListener('verified', (e) => {
			this.state = {...this.state, token: e.token}
			$captchaInput.checked = true
		})
		$signupCaptcha.addEventListener('error', (e) => {
			$captchaInput.checked = false
			console.log('error event', {error: e.error})
		})
		this.querySelector('slot[name="fields"]').append($signupCaptchaField)
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()
		this.disableForm()

		let res = {}
		let error = null

		let options = null
		if (this.state.token) {
			options = {captchaToken: this.state.token}
		}

		try {
			res = await sdk.auth.signIn({
				email: this.state.email,
				password: this.state.password,
				options,
			})
			if (res.error) {
				if (res.error.message === 'Email not confirmed') {
					res.error.code = 'email-not-confirmed'
				}
				if (res.error.message.startsWith('captcha verification process failed')) {
					res.error.code = 'captcha-required'
				}
				if (res.error.message === 'Invalid login credentials') {
					res.error.code = 'invalid-login-credentials'
				}
				throw res.error
			}
		} catch (err) {
			this.handleError(err)
		} finally {
			const signupCaptcha = this.querySelector('h-captcha')
			signupCaptcha?.reset()
		}

		this.enableForm()

		const {data} = res
		if (data?.user && data.session) {
			this.resetForm()
		}

		super.handleSubmit({
			error,
			data,
		})
	}
}
