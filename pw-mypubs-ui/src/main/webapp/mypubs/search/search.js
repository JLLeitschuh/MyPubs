(function() {
	var DEFAULT_PAGE_SIZE = 100;

	angular.module('pw.search', ['ngRoute', 'ngGrid', 'pw.publicationDAO', 'pw.pubsListDAO', 'pw.modal', 'pw.notify'])


	.config(['$routeProvider',
	         function($routeProvider) {
		$routeProvider.when('/Search', {
			templateUrl: 'mypubs/search/search.html',
			controller: 'searchCtrl'
		});
	}
	])

	.controller('searchCtrl', [ '$scope', '$location', 'PublicationFetcher', 'PubsListFetcher', 'PubsListUpdater', 'PubsModal', 'Notifier',
	function($scope, $location, PublicationFetcher, PubsListFetcher, PubsListUpdater, PubsModal, Notifier) {
		$scope.pubsLists = [];
		$scope.pubs = [];
		$scope.lists = [];
		$scope.advancedSearch = false;
		
		$scope.searchProdID = "";
		$scope.searchIndexID = "";
		$scope.searchIPDS = "";
		$scope.searchContributor = "";
		$scope.searchTitle = "";
		$scope.searchSeries = "";
		$scope.searchPubType = "";
		$scope.searchYear = "";
		$scope.searchJournal = "";

		PubsListFetcher.fetchAllLists().then(
			function(value) {
				$scope.pubsLists = value.data;
			},
			function(reason) {
				if (reason.status !== 401) {
					Notifier.error('Publication lists could not be loaded');
				}
			}
		);


		$scope.searchClick = function(searchTermField) {
			$scope.searchTerm = searchTermField; //a way for us to not update the model until we get a click
			$scope.search();
		};

		$scope.toggleAdvancedSearch = function() {
			$scope.advancedSearch = !$scope.advancedSearch;
		}
		
		$scope.search = function() {
			$scope.pubs = {}; //clear grid for loader
			$scope.pubsGrid.ngGrid.$root.addClass("pubs-loading-indicator");

			var searchTerm = "";
			var listIds = [];
			var advancedSearchTerms = {};
			
			if ($scope.advancedSearch) {
				if ($scope.searchProdID && 0 < $scope.searchProdID.length) {
					advancedSearchTerms.prodId = $scope.searchProdID;
				}
				if ($scope.searchIndexID && 0 < $scope.searchIndexID.length) {
					advancedSearchTerms.indexId = $scope.searchIndexID;
				}
				if ($scope.searchIPDS && 0 < $scope.searchIPDS.length) {
					advancedSearchTerms.ipdsId = $scope.searchIPDS;
				}
				if ($scope.searchContributor && 0 < $scope.searchContributor.length) {
					advancedSearchTerms.contributor = $scope.searchContributor;
				}
				if ($scope.searchTitle && 0 < $scope.searchTitle.length) {
					advancedSearchTerms.title = $scope.searchTitle;
				}
				if ($scope.searchSeries && 0 < $scope.searchSeries.length) {
					advancedSearchTerms.seriesName = $scope.searchSeries;
				}
				if ($scope.searchPubType && 0 < $scope.searchPubType.length) {
					advancedSearchTerms.typeName = $scope.searchPubType;
				}
				if ($scope.searchYear && 0 < $scope.searchYear.length) {
					advancedSearchTerms.year = $scope.searchYear;
				}
//				if ($scope.searchJournal && 0 < $scope.searchJournal.length) {
//					advancedSearchTerms. = $scope.searchJournal;
//				}
			} else {
				searchTerm = $scope.searchTerm;
	
				//create array of listIds
				if($scope.selectedPubsLists) {
					for(var i in $scope.selectedPubsLists) {
						listIds.push($scope.selectedPubsLists[i].id);
					}
				}
			}
			
			var pageSize = $scope.pagingState.pageSize;

			var currentPage = $scope.pagingState.currentPage;
			var startRow = (currentPage - 1) * pageSize;
			PublicationFetcher.searchByTermAndListIds(searchTerm, listIds, 
					advancedSearchTerms.prodId, advancedSearchTerms.indexId, advancedSearchTerms.ipdsId,
					advancedSearchTerms.contributor, advancedSearchTerms.title, advancedSearchTerms.seriesName,
					advancedSearchTerms.typeName, advancedSearchTerms.year, pageSize, startRow).then(function(httpPromise){
				$scope.pubs = httpPromise.data.records;
				$scope.recordCount = httpPromise.data.recordCount;
				$scope.selectedPubs.length = 0; //clear selections, for some reason, ngGrid/angular needs a reference to the original array to keep the watch valid
				$scope.pubsGrid.ngGrid.$root.removeClass("pubs-loading-indicator");
			});
			$scope.searchTerm = searchTerm; //apply search term to scope so template updates
		};

		$scope.editSelectedPublication = function() {
			if($scope.selectedPubs.length == 1) {
				$location.path("/Publication/" + $scope.selectedPubs[0].id);
			} else {
				PubsModal.alert("Select One Publication", "You must select one, and only one, publication to edit.");
			}
		};

		$scope.listSelect2Cfg = {
			allowClear: true,
			placeholder: 'Select List(s)'
		};
		
		$scope.addToList = function() {
			if($scope.selectedPubs.length > 0 && $scope.lists.length > 0) {
				PubsListUpdater.addPubsToList($scope.lists, $scope.selectedPubs, $scope.pubsLists).then(
					function(value) {
						var msg = '';
						value.forEach(function(val){
							msg = msg + val + '\n';
						})
						PubsModal.alert('Publication(s) added to the list(s)', msg, true);
						$scope.lists = [];
					},
					function(reason) {
						if (reason.status !== 401) {
							Notifier.error('Publication(s) could not be added to the list(s)');
						}
					}
				);
			} else {
				PubsModal.alert("Select Publication(s)", "You must select at least one publication to add to the list(s)");
			}
		};

		$scope.removeFromList = function() {
			if($scope.selectedPubs.length > 0 && $scope.selectedPubsLists.length == 1) {
				var list = $scope.selectedPubsLists[0];
				PubsListUpdater.removePubsFromList(list.id, $scope.selectedPubs).then(
						function(value) {
							var msg = '';
							value.forEach(function(val){
								msg = msg + val + '\n';
							})
							PubsModal.alert('Publication(s) removed from the list "' + list.text + '"', msg, true);
							$scope.search();
						},
						function(reason) {
							if (reason.status !== 401) {
								Notifier.error('Publication(s) could not be removed from the list');
							}
						}
					);
			} else {
				PubsModal.alert("Select both Publication(s) and a List", "You must select at least one publication and the list to remove it from");
				$scope.search();
			}
		};

		$scope.selectedPubsLists = [];
		$scope.pubsListGrid = {
				data: 'pubsLists',
				selectedItems: $scope.selectedPubsLists,
				columnDefs: [
				             {field:'text', displayName:'Name'},
				             {field:'description', displayName:'Description'}],
				sortInfo: {fields: ['text'], directions: ['asc']},
				enableSorting: true
		};

		$scope.selectedPubs = [];
		$scope.pagingState = {
				pageSizes: [15, 25, 50, 100],
				pageSize: DEFAULT_PAGE_SIZE,
				currentPage: 1
		};

		//TODO these templates are extracted from the main search template. This is a work around since
		//ngGrid does not support passing in a template location for each of the cellTemplate configs.
		//Would like to either remove the direct dom calls here into a service, or wait for ngGrid to support
		//templateUrl.
		var textFieldCellTemplate = $('#textFieldCellTemplate').html();
		var authorsCellTemplate = $('#authorsCellTemplate').html();
		//TODO: need to use a function since we do not have ng-repeat in cellTemplate, this is "view" code that should be moved out of the controller
		$scope.formatAuthors = function(authArray) {
			var authString = "";
			angular.forEach(authArray, function(auth) {
				if(authString.length > 0) {
					authString += "; ";
				}

				//person
				if(auth.family || auth.given) {
					authString += auth.given + " " + auth.family + (auth.suffix ? ' ' + auth.suffix : '');
				} else if(auth.organization) { //corporation/organization as author
					authString += auth.organization;
				}
			});
			return authString;
		};

		$scope.pubsGrid = {
				data: 'pubs',
				selectedItems: $scope.selectedPubs,
				columnDefs: [
		            {field:'publicationType', displayName:'Type', width: 75,
						cellTemplate: textFieldCellTemplate, sortable: false },
					{field:'seriesTitle', displayName:'USGS Series', width: 150,
						cellTemplate: textFieldCellTemplate, sortable: false },
					{field:'seriesNumber', displayName:'Report Number', width: 125},
					{field:'publicationYear', displayName:'Year', width: 50},
					{field:'title', displayName:'Title'},
					{field:'authors', displayName:'Author', width: 250,
						cellTemplate: authorsCellTemplate, sortable: false }
				],
				enableSorting: true,
				enableColumnResize: true,
				showFooter: true,
				totalServerItems: 'recordCount',
				enablePaging: true,
				pagingOptions: $scope.pagingState
	};

	//Watches to update pub list when list selection or paging settings change
	$scope.$watch('pagingState', function (newVal, oldVal) {
		$scope.search();
	}, true);
	$scope.$watch('selectedPubsLists', function (newVal, oldVal) {
		$scope.search();
	}, true);

}]);
}) ();
