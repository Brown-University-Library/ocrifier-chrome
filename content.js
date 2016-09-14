//The output of this function will be returned to popup and usable by its callback.
(function() {
    //Don't do this on Josiah, Worfdev, or OCRA.
    if ( window.location.hostname.indexOf('worfdev.services.brown.edu') > -1 ) return [];
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
        { pat: /isbn.{0,20}\s(\d\-?\d{3}\-?\d{5}\-?[1-9X])/gi, type: 'isbn', },
        { pat: /isbn.{0,20}(\d{3}-?\d{10})/gi, type: 'isbn', },
        { pat: /(10[.][0-9]{3,}(?:[.][0-9]+)*\/(?:(?!["&\'?<>])\S)+)/g, type: 'doi', },
    ]

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
        //TODO: Look at window.location and see if there's a PMID/DOI/ISBN there we can use.
    } else if ( window.location.href.indexOf('amazon.') > -1 &&
               ( window.location.href.indexOf('/dp/') > -1 || window.location.href.indexOf('/ASIN/') > -1 ) ) {

        outp.forEach( function(i) {
            if ( 'isbn' == i.type && window.location.href.indexOf('/dp/'+i.match) > -1 ) {
                outp.push({
                    type:       'page',
                    match:      i.match,
                    clas:       'isbn',
                    label:      'ISBN',
                });
            }
            if ( 'isbn' == i.type && window.location.href.indexOf('/ASIN/'+i.match) > -1 ) {
                outp.push({
                    type:       'page',
                    match:      i.match,
                    clas:       'isbn',
                    label:      'ISBN',
                });
            }
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
