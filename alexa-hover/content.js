document.addEventListener("mouseover", (e) => {
    try{
        let hostname=new URL(e.target.closest('a').href).hostname;
        if(hostname==='')return;
        chrome.runtime.sendMessage({
            "hostname":hostname
        })
    }catch{}
});
document.onmouseout = (e) => { chrome.runtime.sendMessage({ hostname: null }) };


