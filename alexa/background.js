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



function onClicked(tab) {
	let alexa_url = 'http://www.alexa.com/siteinfo/' + new URL(tab.url).hostname;
	chrome.tabs.create({ url: alexa_url });
}

chrome.browserAction.onClicked.addListener(onClicked);

async function committed(details) {
	if (details.frameId !== 0) { return; }
	const hostname = new URL(details.url).hostname;
	try {
		if (typeof rankTable[hostname] === 'undefined') {



			const res = await fetch(infourl + hostname);
			/*if (res.status !== 200) {
				rankTable[hostname] = 'E' + res.status;
				console.log(rankTable[hostname]);
				return;
			}*/
			if (res.status!==200) {
				chrome.browserAction.setBadgeText({
					tabId: details.tabId,
					text: 'E' + res.status
				});
				return;
			}
			//rankTable[hostname] = "0";

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
			} catch (e) { rankTable[hostname] = '0' }

			try {
				countryTable[hostname] += doc.querySelector('.textsmall.nomarginbottom.margintop10').textContent + '\n'; //country
			} catch (e) { }

			try {
				const list = doc.querySelectorAll('.Block.truncation.Link'); //related websites
				for (let x of list) countryTable[hostname] += x.innerText + '\n';
			} catch (e) { }



			/*const res = await fetch(infourl + hostname);
			
			const res_text = await res.text();
			const doc = parser.parseFromString(res_text, 'text/html');*/

			/*countryTable[hostname] = doc.querySelector('.white.nounderline.truncation').textContent + '\n';
			const rank = doc.querySelector('span.hash').nextSibling.textContent.trim();
			rankTable[hostname] = shortTextForNumber(strToInt(rank));
			countryTable[hostname] += doc.querySelector('.textsmall.nomarginbottom.margintop10').textContent + '\n';
			const list = doc.querySelectorAll('.Block.truncation.Link');
			for (let x of list) countryTable[hostname] += x.innerText + '\n';*/
		}

	} catch (e) {
		console.log(e);
	}
	chrome.browserAction.setBadgeText({
		tabId: details.tabId,
		text: rankTable[hostname]
	});
	chrome.browserAction.setTitle({
		tabId: details.tabId,
		title: countryTable[hostname]
	});

}
chrome.webNavigation.onCommitted.addListener(committed, { url: [{ schemes: ["https", "http"] }] });