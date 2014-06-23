(function() {


angular.module('pw.fetcher',[])
.service('PublicationFetcher', function() {

    var ctx = this

    ctx.pub = {}

	ctx.getById = function(pubId) {
		var pub = { // TODO to be fetched
			pid  : "700000000",
			idx  : "otr8068900",
			public_date    : "05/28/2014", // 6/17/14
			pub_type       : "2",
			series_title   : "",
			subseries      : "Climate change adaption Series",
			series_number  : "2012-1234",
			collaborators  : "ABC",
			abstract       : "This is an entry. The quick brown fox jumps over the lazy dog. Sally sells sea shells at the sea shore.",
			usgs_citation  : "This is an entry. The quick brown fox jumps over the lazy dog. Sally sells sea shells at the sea shore.",
            links          : [
                {
                    id:"a",
                    type:"r",
                    url :"http://foo/bar.pdf",
                    text:"Report A",
                    size:"1 kb",
                    fileType:"pdf",
                    description:"A Test Link",
                    order:0,
                },
                {
                    id:"b",
                    type:"r",
                    url :"http://foo/bar.pdf",
                    text:"Report B",
                    size:"2 kb",
                    fileType:"pdf",
                    description:"B Test Link",
                    order:1,
                },
                {
                    id:"c",
                    type:"r",
                    url :"http://foo/bar.pdf",
                    text:"Report C",
                    size:"3 kb",
                    fileType:"pdf",
                    description:"C Test Link",
                    order:2,
                }
            ],
            contacts       : [
                {
                    id : "a",
                    link: "https://github.com/USGS-CIDA/Publications-Warehouse",
                    link_text: "github home",
                    name:"USGS Center for Integrated Data Analytics",
                    address1:"8505 Reseach Way",
                    address2:"Suite 200",
                    address3:"c/o Scott",
                    city:"Midleton",
                    state:"WI",
                    zipcode:"53562",
                    website:"http://cida.usgs.gov",
                },
                {
                    id : "b",
                    link: "https://github.com/USGS",
                    link_text: "github home",
                    name:"USGS Cartographic Applications and Processing Program",
                    address1:"505 Science Drive",
                    address2:"Suite 200",
                    address3:"c/o Frank",
                    city:"Madison",
                    state:"WI",
                    zipcode:"53711",
                    website:"http://www.usgs.gov",
                },
                {
                    id : "c",
                    link: "https://github.com/USGS-CIDA/Publications-Warehouse",
                    link_text: "github home",
                    name:"USGS",
                    address1:"8505 Reseach Way",
                    address2:"Suite 200",
                    address3:"c/o Scott",
                    city:"Midleton",
                    state:"WI",
                    zipcode:"53562",
                    website:"http://cida.usgs.gov",
                },
                {
                    id : "d",
                    link: "https://github.com/USGS",
                    link_text: "github home",
                    name:"CIDA",
                    address1:"505 Science Drive",
                    address2:"Suite 200",
                    address3:"c/o Frank",
                    city:"Madison",
                    state:"WI",
                    zipcode:"53711",
                    website:"http://www.usgs.gov",
                },
            ],
		}
        ctx.pub = pub
		return pub
	}


    this.get = function() {
        return ctx.pub
    }


	this.getByFilter = function(filter) {
		return {}
	}

})


}) ()

/** CSL JSON
{
    "description": "JSON schema (draft 3) for CSL input data",
    "id": "https://github.com/citation-style-language/schema/raw/master/csl-data.json",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "type": {
                "type": "string",
                "required": true,
                "enum" : [
                    "article",
                    "article-journal",
                    "article-magazine",
                    "article-newspaper",
                    "bill",
                    "book",
                    "broadcast",
                    "chapter",
                    "dataset",
                    "entry",
                    "entry-dictionary",
                    "entry-encyclopedia",
                    "figure",
                    "graphic",
                    "interview",
                    "legal_case",
                    "legislation",
                    "manuscript",
                    "map",
                    "motion_picture",
                    "musical_score",
                    "pamphlet",
                    "paper-conference",
                    "patent",
                    "personal_communication",
                    "post",
                    "post-weblog",
                    "report",
                    "review",
                    "review-book",
                    "song",
                    "speech",
                    "thesis",
                    "treaty",
                    "webpage" 
                ] 
            },
            "id": {
                "type": [
                    "string",
                    "number" 
                ],
                "required": true 
            },
            "categories": {
                "type": "array",
                "items": {
                    "type": "string" 
                } 
            },
            "language": {
                "type": "string" 
            },
            "journalAbbreviation": {
                "type": "string" 
            },
            "shortTitle": {
                "type": "string" 
            },
            "author": {
                "type": "array",
                "items": {
                    "id": "name-variable",
                    "type": [
                        {
                            "properties": {
                                "family" : {
                                    "type": "string" 
                                },
                                "given" : {
                                    "type": "string" 
                                },
                                "dropping-particle" : {
                                    "type": "string" 
                                },
                                "non-dropping-particle" : {
                                    "type": "string" 
                                },
                                "suffix" : {
                                    "type": "string" 
                                },
                                "comma-suffix" : {
                                    "type": [
                                        "string",
                                        "number",
                                        "boolean" 
                                    ] 
                                },
                                "static-ordering" : {
                                    "type": [
                                        "string",
                                        "number",
                                        "boolean" 
                                    ] 
                                },
                                "literal" : {
                                    "type": "string" 
                                },
                                "parse-names" : {
                                    "type": [
                                        "string",
                                        "number",
                                        "boolean" 
                                    ] 
                                } 
                            },
                            "additionalProperties" : false 
                        },
                        {
                            "properties": {
                                "literal" : {
                                    "type": "string" 
                                } 
                            },
                            "additionalProperties" : false 
                        } 
                    ] 
                } 
            },
            "collection-editor": {
                "type": "array",
                "items": {
                    "$ref": "name-variable" 
                } 
            },
            "composer": {
                "type": "array",
                "items": {
                    "$ref": "name-variable" 
                } 
            },
            "container-author": {
                "type": "array",
                "items": {
                    "$ref": "name-variable" 
                } 
            },
            "director": {
                "type": "array",
                "items": {
                    "$ref": "name-variable" 
                } 
            },
            "editor": {
                "type": "array",
                "items": {
                    "$ref": "name-variable" 
                } 
            },
            "editorial-director": {
                "type": "array",
                "items": {
                    "$ref": "name-variable" 
                } 
            },
            "interviewer": {
                "type": "array",
                "items": {
                    "$ref": "name-variable" 
                } 
            },
            "illustrator": {
                "type": "array",
                "items": {
                    "$ref": "name-variable" 
                } 
            },
            "original-author": {
                "type": "array",
                "items": {
                    "$ref": "name-variable" 
                } 
            },
            "recipient": {
                "type": "array",
                "items": {
                    "$ref": "name-variable" 
                } 
            },
            "reviewed-author": {
                "type": "array",
                "items": {
                    "$ref": "name-variable" 
                } 
            },
            "translator": {
                "type": "array",
                "items": {
                    "$ref": "name-variable" 
                } 
            },
            "accessed": {
                "id": "date-variable",
                "type": [
                    {
                        "properties": {
                            "date-parts": {
                                "type": "array",
                                "items": {
                                    "type": "array",
                                    "items": {
                                        "type": [
                                            "string",
                                            "number" 
                                        ] 
                                    },
                                    "maxItems": 3 
                                },
                                "maxItems": 2 
                            },
                            "season": {
                                "type": [
                                    "string",
                                    "number" 
                                ] 
                            },
                            "circa": {
                                "type": [
                                    "string",
                                    "number",
                                    "boolean" 
                                ] 
                            },
                            "literal": {
                                "type": "string" 
                            },
                            "raw": {
                                "type": "string" 
                            }
                        },
                        "additionalProperties" : false 
                    },
                    {
                        "properties": {
                            "literal": {
                                "type": "string" 
                            } 
                        },
                        "additionalProperties" : false 
                    } 
                ] 
            },
            "container": {
                "$ref": "date-variable" 
            },
            "event-date": {
                "$ref": "date-variable" 
            },
            "issued": {
                "$ref": "date-variable" 
            },
            "original-date": {
                "$ref": "date-variable" 
            },
            "submitted": {
                "$ref": "date-variable" 
            },
            "abstract": {
                "type": "string" 
            },
            "annote": {
                "type": "string" 
            },
            "archive": {
                "type": "string" 
            },
            "archive_location": {
                "type": "string" 
            },
            "archive-place": {
                "type": "string" 
            },
            "authority": {
                "type": "string" 
            },
            "call-number": {
                "type": "string" 
            },
            "chapter-number": {
                "type": "string" 
            },
            "citation-number": {
                "type": "string" 
            },
            "citation-label": {
                "type": "string" 
            },
            "collection-number": {
                "type": "string" 
            },
            "collection-title": {
                "type": "string" 
            },
            "container-title": {
                "type": "string" 
            },
            "container-title-short": {
                "type": "string" 
            },
            "dimensions": {
                "type": "string" 
            },
            "DOI": {
                "type": "string" 
            },
            "edition": {
                "type": [
                    "string",
                    "number" 
                ] 
            },
            "event": {
                "type": "string" 
            },
            "event-place": {
                "type": "string" 
            },
            "first-reference-note-number": {
                "type": "string" 
            },
            "genre": {
                "type": "string" 
            },
            "ISBN": {
                "type": "string" 
            },
            "ISSN": {
                "type": "string" 
            },
            "issue": {
                "type": [
                    "string",
                    "number" 
                ] 
            },
            "jurisdiction": {
                "type": "string" 
            },
            "keyword": {
                "type": "string" 
            },
            "locator": {
                "type": "string" 
            },
            "medium": {
                "type": "string" 
            },
            "note": {
                "type": "string" 
            },
            "number": {
                "type": [
                    "string",
                    "number" 
                ] 
            },
            "number-of-pages": {
                "type": "string" 
            },
            "number-of-volumes": {
                "type": [
                    "string",
                    "number" 
                ] 
            },
            "original-publisher": {
                "type": "string" 
            },
            "original-publisher-place": {
                "type": "string" 
            },
            "original-title": {
                "type": "string" 
            },
            "page": {
                "type": "string" 
            },
            "page-first": {
                "type": "string" 
            },
            "PMCID": {
                "type": "string" 
            },
            "PMID": {
                "type": "string" 
            },
            "publisher": {
                "type": "string" 
            },
            "publisher-place": {
                "type": "string" 
            },
            "references": {
                "type": "string" 
            },
            "reviewed-title": {
                "type": "string" 
            },
            "scale": {
                "type": "string" 
            },
            "section": {
                "type": "string" 
            },
            "source": {
                "type": "string" 
            },
            "status": {
                "type": "string" 
            },
            "title": {
                "type": "string" 
            },
            "title-short": {
                "type": "string" 
            },
            "URL": {
                "type": "string" 
            },
            "version": {
                "type": "string" 
            },
            "volume": {
                "type": [
                    "string",
                    "number" 
                ] 
            },
            "year-suffix": {
                "type": "string" 
            } 
        },
        "additionalProperties" : false 
    } 
}
**/