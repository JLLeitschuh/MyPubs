(function() {


angular.module('pw.contributors', ['pw.contributorDAO', 'pw.dataList', 'pw.fetcher', 'pw.lookups'])
    .value('kind', {person : 'Person', corporation : 'Corporation'})

    .factory('ContributorModel', ['kind', function(kind) {

	var getEmptyContributor = function() {
	    return {
		id : '',
		contributorId : '',
		rank : '',
		kind : '',
		corporation : false
	    };
	};

	function Contributor(data) {
	    if (data) {
		if (data.corporation) {
		    this.kind = kind.corporation;
		}
		else {
		    this.kind = kind.person;
		}
	    }
	    else {
		data = getEmptyContributor();
	    }
	    angular.extend(this, data);
	}

	Contributor.prototype = {
	    changeKind : function() {
		var removeProps = function(obj, propArray) {
		    var i;
		    for (i = 0; i < propArray.length; i++) {
			delete obj[propArray[i]];
		    }
		};

		var CORP_PROPS = ['organization'];
		var PERSON_PROPS = ['family', 'given', 'suffix', 'email', 'affiliation'];

		var i;

		this.contributorId = '';
		if (this.isPerson()) {
		    angular.extend(this, {
			family : '',
			given : '',
			suffix : '',
			email : '',
			affiliation : {}
		    });
		    removeProps(this, CORP_PROPS);
		}
		else if (this.isCorporation()) {
		    angular.extend(this, {
			organization : ''
		    });
		    removeProps(this, PERSON_PROPS);
		}
		else {
		    removeProps(this, CORP_PROPS.concat(PERSON_PROPS));
		}
	    },
	    update : function(data) {
		if (data) {
		    if (data.corporation) {
			this.kind = kind.corporation;
		    }
		    else {
			this.kind = kind.person;
		    }
		    angular.extend(this, data);
		}
		else {
		    this.kind = '';
		    this.id = '';
		    this.contributorId = '';
		    this.corporation = false;
		}
	    },
	    isPerson : function() {
		return this.kind === kind.person;
	    },
	    isCorporation : function() {
		return this.kind === kind.corporation;
	    },
	    getPubData : function() {
		if (this.isPerson()) {
		    return {
			id : this.id,
			contributorId : this.contributorId,
			rank : this.rank,
			corporation : this.corporation,
			family : this.family || '',
			given : this.given || '',
			suffix : this.suffix || '',
			email : this.email || '',
			affiliation : this.affiliation || {}
		    };
		}
		else if (this.isCorporation()) {
		    return {
			id : this.id,
			contributorId : this.contributorId,
			rank : this.rank,
			corporation : this.corporation,
			organization : this.organization || ''
		    };
		}
		else {
		    return {
			id : this.id,
			contributorId : this.contributorId,
			rank : this.rank,
			corporation : this.corporation
		    };
		}
	    }
	};

	return Contributor;
    }])

    .controller('contributorsCtrl',
	['$scope', 'kind', 'Notifier', 'ContributorModel', 'ContributorFetcher', 'LookupFetcher', 'ListOrderingService', function ($scope, kind, Notifier, ContributorModel, ContributorFetcher, LookupFetcher, ListOrderingService) {
	var selectedIndex;

	$scope.contribKindOptions = [kind.person, kind.corporation];

	$scope.isPerson = function(contributor) {
	    return contributor.isPerson(contributor);
	};
	$scope.isCorporation = function(contributor) {
	    return contributor.isCorporation(contributor);
	};

	$scope.contribKindSelect = '';
	$scope.changeKind = function(contributor) {
	    contributor.changeKind();
	};

	LookupFetcher.promise('contributortypes').then(function(response) {
	    $scope.contribTabs = response.data;
	    angular.forEach($scope.contribTabs, function(value, index) {
		// The property in pubs data will be the text in lower case
		var prop = value.text.toLowerCase();

		// Create properties on pubData and then sort by rank
		if (angular.isUndefined($scope.pubData[prop])) {
		    $scope.pubData[prop] = [];
		};
		$scope.pubData[prop] = _.sortBy($scope.pubData[prop], 'rank');

		// This is the scope variable that the html will use.
		$scope.contribTabs[index].data = [];
		angular.forEach($scope.pubData[prop], function(dataValue) {
		    $scope.contribTabs[index].data.push(new ContributorModel(dataValue));
		});

		// angular docs caution using $watch with the objectEquality set to true as
		// there are memory and performance implications.
		$scope.$watch('contribTabs[' + index + '].data', function(newValue) {
		    $scope.pubData[prop] = [];
		    angular.forEach(newValue, function(contributor) {
			$scope.pubData[prop].push(contributor.getPubData());
		    });
		}, true);
	    });
	});

	$scope.$on('refreshPubData', function() {
	    var i;
	    angular.forEach($scope.contribTabs, function(value, index) {
		var prop = value.text.toLowerCase();
		if ($scope.pubData[prop].length === $scope.contribTabs[index].data.length) {
		    $scope.pubData[prop] = _.sortBy($scope.pubData[prop], 'rank');
		    for (i = 0; i < $scope.pubData[prop].length; i++){
			$scope.contribTabs[index].data[i].update($scope.pubData[prop][i]);
		    }
		}
		else {
		    Notifier.warn('Mismatch in returned contributor data');
		}
	    });
	});

	LookupFetcher.promise('people').then(function(response) {
	    $scope.personOptions = response.data;
	});

	LookupFetcher.promise('corporations').then(function(response) {
	    $scope.corporationOptions = response.data;
	});

	$scope.selectedTab = function(index) {
	    selectedIndex = index;
	};

	$scope.sortOptions = {
	    stop : function() {
		ListOrderingService.updateRank($scope.contribTabs[selectedIndex].data);
	    }
	};

	$scope.deleteContributor = function(index) {
	    ListOrderingService.deleteObj($scope.contribTabs[selectedIndex].data, index);
	};

	$scope.addContributor = function() {
	    ListOrderingService.addNewObj($scope.contribTabs[selectedIndex].data, new ContributorModel());
	};

	$scope.updateContributorInfo = function(index) {
	    ContributorFetcher.fetchContributorById($scope.contribTabs[selectedIndex].data[index].contributorId).then(function(response) {
		angular.extend($scope.contribTabs[selectedIndex].data[index], response.data);
	    });

	};
    }]);


}) ();
