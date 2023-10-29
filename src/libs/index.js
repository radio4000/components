/*
	 this file references all dependencies used by the project;
 */

/* external librairies */
import {sdk} from '../libs/sdk.js'
import * as lit from 'lit'
import page from 'page/page.mjs'
import radio4000player from 'radio4000-player'

/* internal utils (are libs too) */
import urlUtils from './url-utils.js'
import dbSchemas from './db-schemas'

export default {
	sdk,
	lit,
	page,
	radio4000player,
	urlUtils,
	dbSchemas,
}
