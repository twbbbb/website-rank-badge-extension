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

let div = document.createElement('div');
div.className = "rankrank";
document.body.append(div);
let myhostname = null;
document.addEventListener("mouseover", (e) => {
    //console.log(e.target.closest('a'));
    let a = e.target.closest('a');
    if (a === null) return;
    let hostname = new URL(e.target.closest('a').href).hostname;
    if (hostname === '') return;
    myhostname = hostname;
    chrome.runtime.sendMessage({
        "hostname": hostname
    },
        (msg) => {
            if (msg.hostname !== myhostname) return;
            let rank=msg.rank;
            if(typeof rank==='number') rank=shortTextForNumber(rank);
            div.innerHTML = rank;
        }
    )
});
document.onmouseout = () => {
    div.innerHTML="";
    myhostname=null;
};