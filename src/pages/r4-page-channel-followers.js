import {html} from 'lit'
import BaseChannel from './base-channel'

export default class R4PageChannelFollowers extends BaseChannel {
	render() {
		const slug = this.channel?.slug
		return html`
			<header>
				<nav>
					<nav-item><code>@</code> <a href=${this.channelOrigin}>${this.params.slug}</a></nav-item>
					<nav-item>
						<code>/</code>
						<a href=${this.channelOrigin + '/following'}>following</a>, followers &
						<a href=${this.channelOrigin + '/feed'}>feed</a>
					</nav-item>
				</nav>
			</header>
			<main>
				<h1>Channels following ${slug}</h1>
				<r4-channel-followers slug=${slug} href=${this.config.href}></r4-channel-followers>
			</main>
		`
	}
}
