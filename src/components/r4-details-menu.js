import {LitElement, html} from 'lit'

/**
 * A dropdown menu
*/

export default class R4DetailsMenu extends LitElement {
	// static properties = {}
	// render() {
	// 	return html`
	// 		<details>
	// 			<summary>⏷</summary>
	// 			<menu>
	// 				<li><button>One</button></li>
	// 				<li><a href="#">One</a></li>
	// 			</menu>
	// 		</details>
	// 	`
	// }
	createRenderRoot() {
		return this
	}
}

// switch (event.key) {
// 	case 'Escape':
// 		if (details.hasAttribute('open')) {
// 			close(details);
// 			event.preventDefault();
// 			event.stopPropagation();
// 		}
// 		break;
// }

// function close(details) {
// 	const wasOpen = details.hasAttribute('open');
// 	if (!wasOpen)
// 		return;
// 	details.removeAttribute('open');
// 	const summary = details.querySelector('summary');
// 	if (summary)
// 		summary.focus();
// }

// function closeCurrentMenu(details) {
// 	if (!details.hasAttribute('open')) return
// 	for (const menu of document.querySelectorAll('details[open] > details-menu')) {
// 		const opened = menu.closest('details')
// 		if (opened && opened !== details && !opened.contains(details)) {
// 			opened.removeAttribute('open')
// 		}
// 	}
// }
