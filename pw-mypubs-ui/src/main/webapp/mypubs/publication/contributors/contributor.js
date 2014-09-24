(function() {


angular.module('pw.contributors', ['pw.contributorDAO', 'pw.dataList', 'pw.lookups'])
    .value('KIND', {person : 'Person', corporation : 'Corporation'})

    .factory('ContributorModel', ['KIND', 'LookupFetcher', function(KIND, LookupFetcher) {

		var getEmptyContributor = function() {
			return {
			id : '',
			contributorId : '',
			rank : '',
			kind : '',
			corporation : false,
			affiliation : {}
			};
		};

		var getOptions = function(isCorporation, contributorId) {
			var lookup;
			var result = {minimumInputLength : 2}
			if (isCorporation) {
				lookup = 'corporations';
			}
			else {
				lookup = 'people';
			}
			return angular.extend(result, LookupFetcher.dynamicSelectOptions(lookup, contributorId));
		};

		function Contributor(data) {
			if (data) {
				if (data.corporation) {
					this.kind = KIND.corporation;
					this.affiliation = {};
				}
				else {
					this.kind = KIND.person;
				}
				this.id = data.id;
				this.contributorId = data.contributorId;
				this.rank = data.rank;
				this.corporation = data.corporation;
				this.affiliation = data.affiliation || {};
				this.select2Options = getOptions(data.corporation, data.contributorId);
			}
			else {
				angular.extend(this, getEmptyContributor());
			}
		}

		Contributor.prototype = {
			changeKind : function() {
				this.contributorId = '';
				this.affiliation = {};
				this.corporation = this.kind === KIND.corporation;
				this.select2Options = getOptions(this.corporation, this.contributorId);
			},
			update : function(data) {
				if (data) {
					// Only update the contributorId object if it has changed
					if (data.contributorId !== this.getContributorId()) {
						this.contributorId = data.contributorId;
					}
					this.id = data.id;
					this.rank = data.rank;
					this.affiliation = data.affiliation || {};
					this.corporation = data.corporation;
					if (data.corporation) {
						this.kind = KIND.corporation;
					}
					else {
						this.kind = KIND.person;
					}
					this.select2Options = getOptions(data.corporation, this.contributorId);

				}
				else {
					this.kind = '';
					this.id = '';
					this.contributorId = '';
					this.corporation = false;
					this.affiliation = {};
				}
			},

			updateContributor : function(data) {
				if (data) {
					if (this.getContributorId() !== data.contributorId) {
						this.contributorId = data.contributorId;
					}
					this.affiliation = data.affiliation || {};
				}
			},
			isPerson : function() {
				return this.kind === KIND.person;
			},
			isCorporation : function() {
				return this.kind === KIND.corporation;
			},
			getContributorId : function() {
				if (angular.isDefined(this.contributorId.id)) {
					return this.contributorId.id;
				}
				else {
					return this.contributorId;
				}
			},
			getPubData : function() {
				return {
					id : this.id,
					contributorId : this.getContributorId(),
					rank : this.rank,
					corporation : this.corporation,
					affiliation : this.affiliation || {}
				};
			}
		};

		return Contributor;
    }])

    .controller('contributorsCtrl',
	['$scope', 'KIND', 'Notifier', 'ContributorModel', 'ContributorFetcher', 'LookupFetcher', 'ListOrderingService', function ($scope, KIND, Notifier, ContributorModel, ContributorFetcher, LookupFetcher, ListOrderingService) {
			var selectedIndex;

			$scope.contribKindOptions = [KIND.person, KIND.corporation];

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
						Notifier.error('Mismatch in returned contributor data');
					}
				});
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
				ContributorFetcher.fetchContributorById($scope.contribTabs[selectedIndex].data[index].getContributorId()).then(function(response) {
					$scope.contribTabs[selectedIndex].data[index].updateContributor(response.data);
				});
			};
    }]);


}) ();
