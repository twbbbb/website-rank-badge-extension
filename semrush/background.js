'use strict'

let rankTable = {};

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



function onClicked(tab) {
	let url = 'https://www.semrush.com/analytics/overview/?q=' + new URL(tab.url).hostname;
	chrome.tabs.create({ "url": url });
}

chrome.browserAction.onClicked.addListener(onClicked);
//let fetchCount = 0;
const parser = new DOMParser();
async function fetchData(hostname){
	if (typeof rankTable[hostname] === 'undefined') {
		//console.log(`${fetchCount++} fetch ${hostname}`);
		const res = await fetch("https://seoquake.publicapi.semrush.com/info.php?url="+hostname);
		if (res.status !== 200) {
			return 'E' + res.status;
		}
		const res_text = await res.text();
		const doc = parser.parseFromString(res_text, 'text/xml');
		rankTable[hostname]=0;
		try {
			let r = doc.querySelector('rank').textContent;
			rankTable[hostname] = parseInt(r);
		} catch { };
	}
	return rankTable[hostname];
}

async function committed(details) {
	if (details.frameId !== 0) { return; }
	const hostname = new URL(details.url).hostname;

	let text;
	await fetchData(hostname).then((r)=>text=r);
	let title=text;
	if(typeof text==='number'){
		text=shortTextForNumber(text);
		title=String(title);
	}
	chrome.browserAction.setBadgeText({
		tabId: details.tabId,
		text: text
	});
	chrome.browserAction.setTitle({
		tabId: details.tabId,
		title: title
	});

}
chrome.webNavigation.onCommitted.addListener(committed, { url: [{ schemes: ["https", "http"] }] });

function badge(msg,_,send) {
	fetchData(msg.hostname).then(r=>send({hostname:msg.hostname, rank:r}));
	return true;
	//send({hostname:123, rank:456});
}
chrome.runtime.onMessage.addListener(badge);