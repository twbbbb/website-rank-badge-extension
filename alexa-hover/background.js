'use strict'
const infourl = 'https://www.alexa.com/minisiteinfo/'
const parser = new DOMParser();

let rankTable = {};
let countryTable = {};

const shortTextForNumber = (number) => {
	if (number < 10000) {
		return number.toString()
	} else if (number < 1000000) {
		return Math.floor(number / 1000)
			.toString() + "k"
	} else {
		return Math.floor(number / 1000 / 1000)
			.toString() + "m"
	}
}

const strToInt = (str) => {
	// Numbers are displayed as strings with delimeters (e.g. 123,564).
	return parseInt(str.trim()
		.replace(/,/g, ""))
}



function onClicked(link) {
	let alexa_url = 'http://www.alexa.com/minisiteinfo/' + new URL(link).hostname;
	chrome.tabs.create({ url: alexa_url });
}

chrome.browserAction.onClicked.addListener((tab) => { onClicked(tab.url) });

async function fetchData(hostname) {
	if (typeof rankTable[hostname] !== 'undefined') {
		const tmp = rankTable[hostname];
		if (tmp[0] !== 'E' || tmp !== 'ban?') return;
	}
	rankTable[hostname] = "wait";
	countryTable[hostname]="wait";
	const res = await fetch(infourl + hostname);
	if (res.status !== 200) {
		rankTable[hostname] = 'E' + res.status;
		console.log(rankTable[hostname]);
		return;
	}
	const res_text = await res.text();
	const doc = parser.parseFromString(res_text, 'text/html');

	try {
		countryTable[hostname] = doc.querySelector('.white.nounderline.truncation').textContent + '\n'; //host
	} catch (e) {
		console.log(e);
		rankTable[hostname] = 'ban?';
		return;
	}

	try {
		const rank = doc.querySelector('span.hash').nextSibling.textContent.trim(); //rank
		countryTable[hostname] += rank + '\n';
		rankTable[hostname] = shortTextForNumber(strToInt(rank));
	} catch (e) { rankTable[hostname]='0'}

	try {
		countryTable[hostname] += doc.querySelector('.textsmall.nomarginbottom.margintop10').textContent + '\n'; //country
	} catch (e) { }

	try {
		const list = doc.querySelectorAll('.Block.truncation.Link'); //related websites
		for (let x of list) countryTable[hostname] += x.innerText + '\n';
	} catch (e) { }

}
let hostname = null;
async function badge(msg) {
	hostname = msg.hostname;
	if (hostname === null) {
		chrome.browserAction.setBadgeText({ text: '' });
		return;
	}
	let myhostname = hostname;
	await fetchData(hostname);
	if (myhostname === hostname) {
		chrome.browserAction.setBadgeText({ text: rankTable[hostname] });
		chrome.browserAction.setTitle({ title: countryTable[hostname] });
	}
}
chrome.runtime.onMessage.addListener(badge);