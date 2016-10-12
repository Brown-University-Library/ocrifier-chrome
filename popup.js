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
    document.getElementById('logo').setAttribute('src', ocra_logo_image);
    setStatus(ocra_status_start);

    chrome.tabs.executeScript({file: 'content.js'}, function(data) {
        if ( undefined !== data && data[0].length > 0 ) {
            data[0].forEach(function(m) {
                el = document.getElementById(m.type);
                el.removeAttribute('hidden');
                lst = el.getElementsByTagName('ul')[0];
                if ( 'page' == m.type ) {
                    document.getElementById('thispage').removeAttribute('hidden');
                    lnkurl = ocra_target_page+'?'+m.clas+'='+m.match;
                    lnk = '<b>'+m.label+':</b> <a href="'+lnkurl+'">'+m.match+'</a>';
                } else {
                    document.getElementById('otherids').removeAttribute('hidden');
                    lnkurl = ocra_target_page+'?'+m.type+'='+m.match;
                    lnk = '<a href="'+lnkurl+'">'+m.match+'</a>';
                }
                lst.innerHTML += "<li>"+lnk+"</li>\n";
            });

            setStatus(ocra_status_ready);
            $('#tabName').blur();
        } else {
            //Shouldn't happen. There's always the page URL as a last resort.
            setStatus(ocra_status_nothing_to_do);
        }
    });
});
