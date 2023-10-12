import {html} from 'lit'
import BaseChannel from './base-channel'

export default class R4PageChannelFollowings extends BaseChannel {
	render() {
		const slug = this.channel?.slug
		return html`
			<r4-page-header>
				<code>@</code> <a href=${this.channelOrigin}>${this.params.slug}</a> <code>/</code> following,
				<a href=${this.channelOrigin + '/followers'}>followers</a> &
				<a href=${this.channelOrigin + '/feed'}>feed</a>
			</r4-page-header>
			<r4-page-main>
				<h1>Channels which ${slug} follows</h1>
				<r4-channel-followings slug=${slug} href=${this.config.href}></r4-channel-followings>
			</r4-page-main>
		`
	}
}
