'use strict'
/*const infourl = 'https://www.alexa.com/minisiteinfo/'
const parser = new DOMParser();*/

let rankTable = {};
//let countryTable = {};
chrome.browserAction.setBadgeBackgroundColor({color:'black'})
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

/*const strToInt = (str) => {
	// Numbers are displayed as strings with delimeters (e.g. 123,564).
	return parseInt(str.trim()
		.replace(/,/g, ""))
}*/



/*function onClicked(link) {
	let alexa_url = 'http://www.alexa.com/minisiteinfo/' + new URL(link).hostname;
	chrome.tabs.create({ url: alexa_url });
}*/

//chrome.browserAction.onClicked.addListener((tab) => { onClicked(tab.url) });

async function fetchData(hostname) {
	if (typeof rankTable[hostname] !== 'undefined') {
		const tmp = rankTable[hostname];
		if (tmp[0] !== 'E' /*|| tmp !== 'ban?'*/) return;
	}
	rankTable[hostname] = "wait";
	//countryTable[hostname]="wait";
	const res = await fetch("https://rank.similarweb.com/api/v1/global", {
		body: 'e=q=https://' + hostname,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			//hiw8: hostname
		},
		method: "POST"
	});
	if (res.status !== 200) {
		rankTable[hostname] = 'E' + res.status;
		console.log(rankTable[hostname]);
		return;
	}
	const doc = await res.json();
	rankTable[hostname]=doc.Rank;

	/*try {
		countryTable[hostname] = doc.querySelector('.white.nounderline.truncation').textContent + '\n'; //host
	} catch (e) {
		console.log(e);
		rankTable[hostname] = 'ban?';
		return;
	}

	try {
		console.log(doc.querySelector('span.hash'));
		const rank = doc.querySelector('span.hash').nextSibling.textContent.trim(); //rank
		countryTable[hostname] += rank + '\n';
		rankTable[hostname] = shortTextForNumber(strToInt(rank));
	} catch (e) { rankTable[hostname]='0';console.log(e)}

	try {
		countryTable[hostname] += doc.querySelector('.textsmall.nomarginbottom.margintop10').textContent + '\n'; //country
	} catch (e) { }

	try {
		const list = doc.querySelectorAll('.Block.truncation.Link'); //related websites
		for (let x of list) countryTable[hostname] += x.innerText + '\n';
	} catch (e) { }*/

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
		chrome.browserAction.setBadgeText({ text: shortTextForNumber(rankTable[hostname]) });
		//chrome.browserAction.setTitle({ title: countryTable[hostname] });
	}
}
chrome.runtime.onMessage.addListener(badge);