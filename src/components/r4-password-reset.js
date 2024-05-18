import {sdk} from '../libs/sdk.js'
import R4Form from './r4-form.js'
import '@hcaptcha/vanilla-hcaptcha'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<legend for="email">Email</legend>
			<input type="email" autocomplete="username" name="email" required placeholder="email@example.org"/>
		</fieldset>
	</slot>
`

const captchaFieldTemplate = document.createElement('template')
captchaFieldTemplate.innerHTML = `
	<fieldset>
		<legend>Captcha</legend>
		<label for="token">
			<input name="token" type="radio" disabled required placeholder="R4_USED_BY_ONVERIFIED"></input>
			<h-captcha
				site-key="R4_SET_BY_INIT_CAPTCHA"
				size="normal"
				color-
				tabindex="0"></h-captcha>
		</label>
	</fieldset>
`

export default class R4PasswordReset extends R4Form {
	submitText = 'Send reset password (magic) link'

	errors = {
		default: {
			message: 'Unhandled error',
		},
		'captcha-required': {
			message: 'The Captcha is missing. Please solve it to sign in.',
		},
	}

	constructor() {
		super()
		this.fieldsTemplate = fieldsTemplate
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

		const options = {
			emailRedirectTo: window.location.href,
		}

		if (this.state.token) {
			options.captchaToken = this.state.token
		}

		try {
			res = await sdk.supabase.auth.signInWithOtp({
				email: this.state.email,
				options,
			})
			if (res.error) {
				throw res.error
			}
		} catch (error) {
			console.info('Failed to reset password', error, error.message)
			if (error.message.includes('captcha verification process failed')) {
				error.code = 'captcha-required'
			}
			if (error.message.includes('placeholder')) {
				error.code = 'wrong-pattern'
			}
			this.handleError(error)
		} finally {
			const signupCaptcha = this.querySelector('h-captcha')
			signupCaptcha?.reset()
		}

		this.enableForm()

		const {data} = res
		if (!data?.error) {
			this.resetForm()
		}

		super.handleSubmit({
			error,
			data,
		})
	}
}
