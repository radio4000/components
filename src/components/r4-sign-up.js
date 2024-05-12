import {sdk} from '../libs/sdk.js'
import R4Form from './r4-form.js'
import '@hcaptcha/vanilla-hcaptcha'
/* https://github.com/hCaptcha/vanilla-hcaptcha?tab=readme-ov-file#vanillajs */

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="email">Email</label>
			<input name="email" type="email" required autocomplete="email" placeholder="user@example.com"/>
		</fieldset>
		<fieldset>
			<label for="password">Password</label>
			<input name="password" type="password" required autocomplete="new-password" placeholder="new-unique-password"/>
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

export default class R4SignUp extends R4Form {
	submitText = 'Sign up'

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
			message: "You're signed up, confirm your email to login ",
		},
		'invalid-login-credentials': {
			field: 'email',
			message: 'The email & password combination is incorrect',
		},
		'email-rate-limit': {
			message: 'Rate limit exceeded. Wait five minutes before trying again',
		},
		'password-too-short': {
			field: 'password',
			message: 'Password should be at least 6 characters',
		},
		'captcha-required': {
			message: 'The Captcha is missing. Please solve it to sign up.',
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
			res = await sdk.auth.signUp({
				email: this.state.email,
				password: this.state.password,
				options,
			})
			if (res.error) {
				if (res.error.message.startsWith('For security purposes, you can only request this after')) {
					res.error.code = 'email-not-confirmed'
				}
				if (res.error.message.startsWith('captcha verification process failed')) {
					res.error.code = 'captcha-required'
				}
				if (res.error.stack.includes('Email rate limit exceeded')) {
					res.error.code = 'email-rate-limit'
				}
				if (res.error.stack.includes('Password should be at least 6 characters')) {
					res.error.code = 'password-too-short'
				}
				throw res.error
			}
		} catch (err) {
			this.handleError(err)
		} finally {
			const signupCaptcha = this.querySelector('h-captcha')
			signupCaptcha?.reset()
		}

		const {data} = res
		if (data?.user?.id) {
			this.resetForm()
		} else {
			this.enableForm()
		}

		super.handleSubmit({
			error,
			data,
		})
	}
}
