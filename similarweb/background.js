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
	let url = 'https://www.similarweb.com/website/' + new URL(tab.url).hostname;
	chrome.tabs.create({ "url": url });
}

chrome.browserAction.onClicked.addListener(onClicked);
//let fetchCount = 0;
async function fetchData(hostname){
	if (typeof rankTable[hostname] === 'undefined') {
		//console.log(`${fetchCount++} fetch ${hostname}`);
		const res = await fetch("https://rank.similarweb.com/api/v1/global", {
			body: 'e=q=https://' + hostname,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				//hiw8: hostname
			},
			method: "POST"
		})
		if (res.status !== 200) {
			return 'E' + res.status;
		}
		const doc = await res.json();
		rankTable[hostname] = doc.Rank;
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