//The output of this function will be returned to popup and usable by its callback.
(function() {

    function checkISBN(test) {
        //TODO: Test.
        test = test.replace(/-/g, '')
        if ( 10 == test.length ) {            
            //Thanks to Wikipedia: 
            var i, s = 0, t = 0;
            for (i = 0; i < 10; i++) {
                t += parseInt(test[i], 10);
                s += t;
                console.log('st', s, t);
            }
            return !Boolean(s % 11);
        } else if ( 13 == test.length ) {
            var mult = [1, 3];
            var check = test.substr(0,12).split('').map(parseFloat)
                             .reduce((a, v, i) => a + (v * mult[i%2])) % 10
            check = (0 == check) ? check : 10 - check;
            var checkdig = parseInt(test.substr(12), 10)
            console.log("checking", check, checkdig, check === checkdig)
            return check === checkdig;
        } else return false;
    }

    class Matcher {
        constructor(pat, type) {
            this.pattern = pat;
            this.type = type;
        }

        match(string) {
            var mts = string.matchAll(this.pattern);
            
            console.log(this.type, this.pattern, mts);
            var outp = new Set();
            //If this.type is ISBN, make sure the check digits are correct.
            for ( var mt of mts ) {
                if ( 'isbn' != this.type || checkISBN(mt[1])) 
                    outp.add(mt[1]);
            }

            return outp;
        }
    }

    //Don't do this on OCRA.
    if ( window.location.href.indexOf('//library.brown.edu/reserves') > -1 ) return [];

    //TODO: Move this into the Matcher class? Or into the popup code?
    labels = {
        'bibnum': 'Josiah',
        'doi'   : 'DOI',
        'olid'  : 'OpenLibrary ID',
        'pmid'  : 'PubMed ID',
        'oclc'  : 'OCLC Number',
        'isbn'  : 'ISBN',
        'url'   : 'URL',
    }

    //If this is Josiah, just grab the bib number and use that.
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
    var urlmatch = false;

    //Set regexes we'll use to find potential items: 
    //  ISBN, DOI, OpenLibrary IDs, and OCLC/WorldCat numbers.
    var patterns = [
        new Matcher(/[^\d\-]((\d-?){11}[\dx])[^\d\-]/gi, 'isbn'),
        new Matcher(/[^\d\-](\d{9}[\dx])[^\d\-]/gi, 'isbn'),
        new Matcher(/[^\d\-](978\-?\d{10})[^\d\-]/g, 'isbn'),
        new Matcher(/(10[.][0-9]{3,}(?:[.][0-9]+)*\/(?:(?!["&\'?<>])\S)+)/g, 'doi'),
        new Matcher(/(OL\d{2,10}[WM])/g, 'olid'),
        new Matcher(/(ocm\d{8})/g, 'oclc'),
        new Matcher(/(ocn\d{9})/g, 'oclc'),
        new Matcher(/(on\d{10,})/g, 'oclc'),
    ];

    //If we're on PubMed, look for PubMed IDs.
    if ( window.location.href.indexOf('www.ncbi.nlm.nih.gov/pubmed') > -1 ) {
        patterns.push(new Matcher(/\b([\d]{8})\b/gi, 'pmid'));
    }
    
    var page = false;
    //Match each pattern against the page's contents.
    patterns.forEach( function(pat) {
        ms = pat.match(document.body.textContent);
        console.log('ms', ms)
        ms.forEach((v, m) => {
            if ( outp.find(function(el) {return (el.type == pat.type && el.match == m)}) === undefined ) {
                //Add this match only if it's not in output.
                console.log('adding', pat.type, m)
                outp.push({
                    type:       pat.type,
                    match:      m.trim(),
                });
            }
        });

        if ( !urlmatch ) {
            urlms = pat.match(window.location.href);
            console.log('urlms', urlms);
            urlms.forEach((v, m) => {
                if ( !urlmatch ) {
                    console.log('adding', pat.type, m)
                    urlmatch = {
                        type:       pat.type,
                        match:      m.trim(),
                    };
                }
            });
        }
    });
    
    console.log('output', outp);

    //Everything below here tries to find an ID for this page.
    //Is there an ISBN in a <meta> tag somewhere?
    if ( bookisbn = document.querySelector('meta[property="book:isbn"],meta[property="books:isbn"],meta[name="dc.Identifier"][scheme="isbn"]') 
            && checkISBN(bookisbn) ) {
        //Is dc:identifier(schema=isbn) actually used?
        outp.push({
            type:       'page',
            match:      bookisbn.attributes.content.value,
            clas:       'isbn',
            label:      'ISBN',
        });
        page = true;
    /*
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
        page = true;*/
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
            label:      labels['doi'],
        });
        console.log(outp);
        page = true;
    } else if ( pmid = document.querySelector('meta[name="citation_pmid"]') ) {
        outp.push({
            type:       'page',
            match:      pmid.attributes.content.value,
            clas:       'pmid',
            label:      labels['pmid'],
        });
        page = true;
    } else if ( urlmatch ) {
        outp.push({
            type:       'page',
            match:      urlmatch.match,
            clas:       urlmatch.type,
            label:      labels[urlmatch.type],
        })
    } else {
        outp.push({
            type:       'page',
            match:      window.location.href,
            clas:       'url',
            label:      labels['url'],
        })
    }
    return outp;
})();
