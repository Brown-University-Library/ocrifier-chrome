

//Makes links work.
window.addEventListener('click',function(e){
  if(e.target.href!==undefined){
    chrome.tabs.create({url:e.target.href})
  }
})

function setStatus(newstat) {
    document.getElementById('status').textContent = newstat;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logo').setAttribute('src', logo_image);
    setStatus(status_start);

    chrome.tabs.executeScript({file: 'content.js'}, function(data) {
        if ( data[0].length > 0 ) {
            data[0].forEach(function(m) {
                el = document.getElementById(m.type);
                el.removeAttribute('hidden');
                lst = el.getElementsByTagName('ul')[0];
                if ( 'page' == m.type ) {
                    document.getElementById('thispage').removeAttribute('hidden');
                    lnkurl = target_page+'?'+m.clas+'='+m.match;
                    lnk = '<b>'+m.label+':</b> <a href="'+lnkurl+'">'+m.match+'</a>';
                } else {
                    document.getElementById('otherids').removeAttribute('hidden');
                    lnkurl = target_page+'?'+m.type+'='+m.match;
                    lnk = '<a href="'+lnkurl+'">'+m.match+'</a>';
                }
                lst.innerHTML += "<li>"+lnk+"</li>\n";
            });

            setStatus(status_ready);
        } else {
            //Shouldn't happen. There's always the page URL.
            setStatus(status_nothing_to_do);
        }
    });
});
