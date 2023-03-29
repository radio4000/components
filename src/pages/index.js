import R4PageHome from './r4-page-home.js'
import R4PageExplore from './r4-page-explore.js'
import R4PageChannel from './r4-page-channel.js'
import R4PageSign from './r4-page-sign.js'
import R4PageAdd from './r4-page-add.js'
import R4PageNew from './r4-page-new.js'
import R4PageTracks from './r4-page-tracks'
import R4PageTrack from './r4-page-track'

customElements.define('r4-page-home', R4PageHome)
customElements.define('r4-page-explore', R4PageExplore)
customElements.define('r4-page-channel', R4PageChannel)
customElements.define('r4-page-tracks', R4PageTracks)
customElements.define('r4-page-track', R4PageTrack)
customElements.define('r4-page-sign', R4PageSign)
customElements.define('r4-page-add', R4PageAdd)
customElements.define('r4-page-new', R4PageNew)

export default {
	R4PageHome,
	R4PageExplore,
	R4PageChannel,
	R4PageSign,
	R4PageAdd,
	R4PageNew,
	R4PageTrack,
	R4PageTracks,
}
