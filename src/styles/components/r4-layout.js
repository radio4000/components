import {css} from 'lit';

const host = css`
	:host {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	width: 100%;
	height: 100%;
	border: 1px solid var(--color-border);
	background: var(--color-app-background);
	}
	@media (min-width: 700px) {
	:host {
	flex-direction: row;
	}
	}
`
const mainSlot = css`
	slot[name="main"]::slotted(*) {
	padding: var(--size);
	}
`
const playerSlot = css`
	/* only is r4-layout[is-playing] display player slot */
	:host(:not([is-playing])) slot[name="player"]::slotted(*) {
	display: none;
	}

	:host([ui-state="minimize"]) slot[name="player"]::slotted(*) {}
	:host([ui-state="fullscreen"]) slot[name="player"]::slotted(*) {}
`
const layoutOrder = css`
	r4-layout-menu {
	order: 1;
	}
	r4-layout-main {
	order: 2;
	}
	r4-layout-panel {
	order: 1;
	}
	r4-layout-playback {
	order: 0;
	z-index: 2;
	}
	@container (min-width: 700px) {
	r4-layout-menu {
	order: 1;
	}
	r4-layout-main {
	order: 2;
	flex: 1;
	}
	:host([ui-state="dock"]) r4-layout-playback {
	order: 2;
	}
	:host([ui-state="dock"]) r4-layout-panel {
	order: 1;
	}
	}
`

const r4LayoutPanel = css`
	r4-layout-panel {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	flex-grow: 1;
	}
`

const r4LayoutControlsMenu = css`
	r4-layout-controls menu {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-around;
	list-style: none;
	margin: 0;
	padding: 0;
	}
	// import default buttons
	r4-layout-controls button {}
`

const stateClose = css`
	:host([ui-state="close"]) [slot="player"],
	:host([ui-state="close"]) radio4000-player {
	display: none;
	}
`

const stateMinimize = css`
	:host([ui-state="minimize"]) {
	position: relative;
	}
	:host([ui-state="minimize"]) r4-player {
	max-width: 10vw;
	}
	:host([ui-state="minimize"]) radio4000-player {
	/* height: auto; */
	/* max-height: calc(var(--size) * 2); */
	}
	:host([ui-state="minimize"]) radio4000-player {
	min-height: auto;
	/* youtube guidelines for video */
	max-height: 200px;
	}
	:host([ui-state="minimize"]) radio4000-player .Layout-header,
	:host([ui-state="minimize"]) radio4000-player .Layout-main {
	display: none;
	}

	:host([ui-state="minimize"]) r4-layout-playback {
	position: sticky;
	top: 0;
	}
	:host([ui-state="minimize"]) r4-layout-controls {
	position: absolute;
	bottom: 0;
	right: 0;
	transform: translateY(100%);
	}

	:host([ui-state="minimize"]) r4-layout-menu {
	position: sticky;
	bottom: 0;
	left: 0;
	order: 3;
	background-color: var(--color-background);
	}

	@media (min-width: 700px) {
	:host([ui-state="minimize"]){
	flex-wrap: wrap;
	justify-content: flex-end;
	}

	:host([ui-state="minimize"]) r4-layout-panel {
	width: 100%;
	}

	:host([ui-state="minimize"]) r4-layout-playback {
	display: flex;
	justify-content: flex-end;
	}

	:host([ui-state="minimize"]) r4-layout-controls {
	position: absolute;
	bottom: 0;
	left: unset;
	top: unset;
	right: 0;
	transform: translateY(100%);
	}
	:host([ui-state="minimize"]) r4-layout-menu {
	order: 1;
	}
	}
`

const stateFullscreen = css`
	:host([ui-state="fullscreen"]) slot[name="player"]::slotted(*) {
	height: 100vh;
	}
	:host([ui-state="fullscreen"]) r4-layout-playback {
	position: relative;
	}
	:host([ui-state="fullscreen"]) r4-layout-controls {
	z-index: 1;
	position: absolute;
	top: 0;
	right: 0;
	}
`

const stateDock = css`
	:host([ui-state="dock"]) r4-layout-playback {
	position: relative;
	display: flex;
	flex-direction: column;
	}
	:host([ui-state="dock"]) r4-layout-controls {
	justify-content: flex-end;
	align-items: flex-start;
	display: flex;;
	order: 2;
	}
	:host([ui-state="dock"]) r4-layout-menu {
	position: sticky;
	top: 0;
	left: 0;
	background-color: var(--color-background);
	}

	@media (min-width: 700px) {
	:host([ui-state="dock"]) r4-layout-playback {
	max-height: 100vh;
	position: sticky;
	top: 0;
	right: 0;
	}
	:host([ui-state="dock"]) r4-layout-controls {
	position: absolute;
	top: 0;
	left: 0;
	transform: translateX(-100%);
	}
	:host([ui-state="dock"]) r4-layout-controls menu {
	flex-direction: column;
	}
	}
`

export default [
	host,
	mainSlot,
	playerSlot,
	layoutOrder,
	r4LayoutControlsMenu,
	r4LayoutPanel,
	stateClose,
	stateMinimize,
	stateFullscreen,
	stateDock,
]
