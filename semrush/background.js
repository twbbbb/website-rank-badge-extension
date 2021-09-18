'use strict'
const infourl = 'https://seoquake.publicapi.semrush.com/info.php?url='
const parser = new DOMParser();
let rankTable = {};
let countryTable = {};

function shortTextForNumber (number) {
	if (number < 1000) {
		return number.toString()
	} else if (number < 10**5) {
		return Math.floor(number / 1000)
			.toString() + "k"
	} else if (number < 10**6) { 
		return Math.floor(number / 10**5) 
			.toString() + "hk"
	} else if(number<10**8){
		return Math.floor(number / 10**6) 
			.toString() + "m"
	} else{
		return Math.floor(number / 10**8)
			.toString() + "hm"
	}
}
/*const shortTextForNumber = (number) => {
	if (number < 10000) {
		return number.toString()
	} else if (number < 1000000) {
		return Math.floor(number / 1000)
			.toString() + "k"
	} else {
		return Math.floor(number / 1000 / 1000)
			.toString() + "m"
	}
}*/

function onClicked(tab) {
	chrome.tabs.create({ url: 'https://www.semrush.com/analytics/overview/?q=' + new URL(tab.url).hostname });
}

chrome.browserAction.onClicked.addListener(onClicked);

async function committed(details) {
	if (details.frameId !== 0) { return; }
	const hostname = new URL(details.url).hostname;
	if (typeof rankTable[hostname] === 'undefined') {
		const res = await fetch(infourl + hostname);
		if (res.status !== 200) {
			chrome.browserAction.setBadgeText({
				tabId: details.tabId,
				text: 'E' + res.status
			});
			return;
		}
		const res_text = await res.text();
		const doc = parser.parseFromString(res_text, 'text/xml');
		rankTable[hostname] = '0';
		let r;
		try {
			r = doc.querySelector('rank').textContent;
			rankTable[hostname] = shortTextForNumber(parseInt(r));
		} catch { };
		try { countryTable[hostname] = doc.querySelector('domain').textContent + '\n' + r } catch(e) { console.log(e)};
	}
	chrome.browserAction.setBadgeText({
		tabId: details.tabId,
		text: rankTable[hostname]
	});
	if(countryTable[hostname]){
		chrome.browserAction.setTitle({
			tabId: details.tabId,
			title: countryTable[hostname]
		});
	}	
}
chrome.webNavigation.onCommitted.addListener(committed, { url: [{ schemes: ["https", "http"] }] });