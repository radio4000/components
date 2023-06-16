import {html} from 'lit'
import BaseChannel from './base-channel'

export default class R4PageChannelFollowings extends BaseChannel {
	render() {
		const slug = this.channel?.slug
		return html`
			<header>
				<code>@</code> <a href=${this.channelOrigin}>${slug}</a> <code>/</code>
				<a href=${this.channelOrigin + '/followings'}>followings</a>
			</header>
			<main>
				<p>Channels which ${slug} follows</p>
				<r4-channel-followings slug=${slug}></r4-channel-followings>
			</main>
		`
	}
}
