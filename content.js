//The output of this function will be returned to popup and usable by its callback.
(function() {
    //Don't do this on Worfdev, or OCRA.
    if ( window.location.hostname.indexOf('//worfdev.services.brown.edu') > -1 ) return [];
    if ( window.location.href.indexOf('//library.brown.edu/reserves') > -1 ) return [];

    if ( window.location.hostname.indexOf('search.library.brown.edu') > -1 ) {
        var bib = /b[0-9]{7}/.exec(window.location.href);
        if ( bib ) {
            var bibnum = bib[0];

            return [{
                type:       'page',
                match:      bibnum,
                clas:       'bibnum',
                label:      'Josiah',
            }];
        }
        else return [];
    }

    var outp = [];
    var patterns = [
        { pat: /isbn.{0,30}[^\d\-](\d[\-\d]{11}[\dx])[^\d\-]/gi, type: 'isbn', },
        { pat: /isbn.{0,30}[^\d\-](\d{9}[\dx])[^\d\-]/gi, type: 'isbn', },
        { pat: /(978-?\d{10})/gi, type: 'isbn', },
        { pat: /(10[.][0-9]{3,}(?:[.][0-9]+)*\/(?:(?!["&\'?<>])\S)+)/g, type: 'doi', },
        { pat: /(OL\d{2,10}[WM])/g, type: 'olid' },
        { pat: /(ocm\d{8})/g, type: 'oclc'},
        { pat: /(ocn\d{9})/g, type: 'oclc'},
        { pat: /(on\d{10,})/g, type: 'oclc'},
    ];

    if ( window.location.href.indexOf('www.ncbi.nlm.nih.gov/pubmed') > -1 ) {
        patterns.push({ pat: /\b([\d]{8})\b/gi, type: 'pmid', });
    }
    
    patterns.forEach( function(i) {
        if ( undefined === i.mat || window.location.href.indexOf(i.mat) > -1 ) {
            var m = i.pat.exec(document.body.textContent); // document.body.textContent?
            while ( m !== null ) {
                if ( outp.find(function(el) {return (el.type == i.type && el.match == m[1])}) === undefined ) {
                    outp.push({
                        type:       i.type,
                        match:      m[1].trim(),
                    });
                }
                m = i.pat.exec(document.body.innerHTML);
            }
        }
    });
    
    var page = false;
    if ( bookisbn = document.querySelector('meta[property="book:isbn"],meta[property="books:isbn"],meta[name="dc.Identifier"][scheme="isbn"]') ) {
        //Is dc:identifier(schema=isbn) actually used?
        outp.push({
            type:       'page',
            match:      bookisbn.attributes.content.value,
            clas:       'isbn',
            label:      'ISBN',
        });
        page = true;
    } else if ( window.location.href.indexOf('amazon.') > -1 &&
               ( window.location.href.indexOf('/dp/') > -1 || 
                 window.location.href.indexOf('/ASIN/') > -1 || 
                 window.location.href.indexOf('/product/') > -1 ) ) {

        outp.forEach( function(i) {
            if ( 'isbn' == i.type && window.location.href.indexOf(i.match) > -1 ) {
                outp.push({
                    type:       'page',
                    match:      i.match,
                    clas:       'isbn',
                    label:      'ISBN',
                });
            }
        });
        page = true;
    } else if ( m = window.location.href.indexOf('josiah.brown.edu') > -1 ) {
        //Josiah Classic.
        var bib = /b[0-9]{7}/i.exec(document.body.textContent);
        if ( bib ) {
            var bibnum = bib[0];

            return [{
                type:       'page',
                match:      bibnum,
                clas:       'bibnum',
                label:      'Josiah',
            }];
        }
    } else if ( m = /(https:\/\/openlibrary.org\/(books|works)\/(OL\d{2,10}[WM]))/.exec(window.location.href) ) {
        outp.push({
            type:       'page',
            match:      m[3],
            clas:       'olid',
            label:      'OpenLibrary ID',
        });
        page = true;
    } else if ( m = /(^https?:\/\/www.ncbi.nlm.nih.gov\/pubmed\/([0-9]{8}))/.exec(window.location.href) ) {
        outp.push({
            type:       'page',
            match:      m[2],
            clas:       'pmid',
            label:      'PubMed ID',
        });
        page = true;
    } else if ( m = /(^https?:\/\/www.worldcat.org\/.+\/oclc\/([0-9]{8,}))/.exec(window.location.href) ) {
        outp.push({
            type:       'page',
            match:      m[2],
            clas:       'oclc',
            label:      'OCLC Number',
        });
    } else if ( doi = document.querySelector('meta[name="citation_doi"]') ) {
        outp.push({
            type:       'page',
            match:      doi.attributes.content.value,
            clas:       'doi',
            label:      'DOI',
        });
        page = true;
    } else if ( doi = document.querySelector('meta[name="dc.Identifier"][scheme="doi"]') ) {
        outp.push({
            type:       'page',
            match:      doi.attributes.content.value,
            clas:       'doi',
            label:      'DOI',
        });
        page = true;
    } else if ( doi = document.querySelector('dd[class="doiLink"] dd[class="doi"] a') ) {
        //ScienceDirect does this.
        outp.push({
            type:       'page',
            match:      doi.textContent,
            clas:       'doi',
            label:      'DOI',
        });
        console.log(outp);
        page = true;
    } else if ( pmid = document.querySelector('meta[name="citation_pmid"]') ) {
        outp.push({
            type:       'page',
            match:      pmid.attributes.content.value,
            clas:       'pmid',
            label:      'PubMed ID',
        });
        page = true;
    } else {
        outp.push({
            type:       'page',
            match:      window.location.href,
            clas:       'url',
            label:      'URL',
        })
    }
    return outp;
})();
