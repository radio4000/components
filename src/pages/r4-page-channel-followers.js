import {html} from 'lit'
import {until} from 'lit/directives/until.js'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'

export default class R4PageChannelFollowers extends BaseChannel {
	render() {
		const slug = this.channel?.slug
		return html`
			<header>
				<code>@</code>
				<a href=${this.channelOrigin}>${slug}</a>
				<code>/</code>
				followers &
				<a href=${this.channelOrigin + '/following'}>following</a>
			</header>
			<main>
				<h1>Channels following ${slug}</h1>
				<r4-channel-followers slug=${slug}></r4-channel-followers>
			</main>
		`
	}
}
