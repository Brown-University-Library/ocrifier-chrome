(function() {
    var bib = /b[0-9]{7}/.exec(window.location.href);
    var bibnum = bib[0];
    var url = ocra_target_page+"?bibnum="+bibnum;
    var lnk = "<a href='"+url+"' target='_blank'>Reserve this item on OCRA</a>";
    var lilnk = '<li class="ocrify">'+lnk+'</li>';
    
    var toolbox = document.getElementsByClassName('show-tools');
    toolbox = toolbox[0];
    var toollist = toolbox.getElementsByTagName('ul')[0];
    toollist.innerHTML += lilnk;
})();