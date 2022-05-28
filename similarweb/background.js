'use strict'

let rankTable = {};
//let countryTable = {};

function shortTextForNumber(number) {
	if (number < 1000) {
		return number.toString()
	} else if (number < 10 ** 5) {
		return Math.floor(number / 1000)
			.toString() + "k"
	} else if (number < 10 ** 6) {
		return Math.floor(number / 10 ** 5)
			.toString() + "hk"
	} else if (number < 10 ** 8) {
		return Math.floor(number / 10 ** 6)
			.toString() + "m"
	} else {
		return Math.floor(number / 10 ** 8)
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
	let url = 'https://www.similarweb.com/website/' + new URL(tab.url).hostname;
	chrome.tabs.create({ "url": url });
}

chrome.browserAction.onClicked.addListener(onClicked);
let fetchCount = 0;
async function committed(details) {
	if (details.frameId !== 0) { return; }
	const hostname = new URL(details.url).hostname;
	if (typeof rankTable[hostname] === 'undefined') {
		console.log(`${fetchCount++} fetch ${hostname}`);
		const res = await fetch("https://rank.similarweb.com/api/v1/global", {
			body: 'e=q=https://' + hostname,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				//hiw8: hostname
			},
			method: "POST"
		})
		if (res.status !== 200) {
			chrome.browserAction.setBadgeText({
				tabId: details.tabId,
				text: 'E' + res.status
			});
			return;
		}
		const doc = await res.json();
		rankTable[hostname] = doc.Rank;
	}

	chrome.browserAction.setBadgeText({
		tabId: details.tabId,
		text: shortTextForNumber(rankTable[hostname])
	});
	chrome.browserAction.setTitle({
		tabId: details.tabId,
		title: String(rankTable[hostname])
	});

}
chrome.webNavigation.onCommitted.addListener(committed, { url: [{ schemes: ["https", "http"] }] });
