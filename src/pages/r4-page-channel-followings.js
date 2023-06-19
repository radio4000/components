import {html} from 'lit'
import BaseChannel from './base-channel'

export default class R4PageChannelFollowings extends BaseChannel {
	render() {
		const slug = this.channel?.slug
		return html`
			<header>
				<code>@</code> <a href=${this.channelOrigin}>${slug}</a> <code>/</code>
				following &
				<a href=${this.channelOrigin + '/followers'}>followers</a>
			</header>
			<main>
				<h1>Channels which ${slug} follows</h1>
				<r4-channel-followings slug=${slug}></r4-channel-followings>
			</main>
		`
	}
}
