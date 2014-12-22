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
		$scope.searchParms = {
				q: "",
				listId: [],
				prodID: "",
				indexID: "",
				ipdsId: "",
				contributor: "",
				title: "",
				typeName: "",
				subtypeName: "",
				seriesName: "",
				year: "",
				page_size: 100,
				page_row_start: 0
			};

		PubsListFetcher.fetchAllLists().then(
			function(value) {
				$scope.pubsLists = value.data;
			},
			function(reason) {
				if (reason.status !== 401 && reason.status !== 403) {
					Notifier.error('Publication lists could not be loaded');
				}
			}
		);


		$scope.searchClick = function(searchTermField) {
			$scope.searchParms.q = searchTermField; //a way for us to not update the model until we get a click
			$scope.search();
		};

		$scope.toggleAdvancedSearch = function(type) {
			$scope.advancedSearch = type;
			$scope.searchParms = {
					q: "",
					listId: [],
					prodId: "",
					indexId: "",
					ipdsId: "",
					contributor: "",
					title: "",
					typeName: "",
					subtypeName: "",
					seriesName: "",
					year: "",
					page_size: 100,
					page_row_start: 0
				};
		};
		
		$scope.search = function() {
			$scope.pubs = {}; //clear grid for loader
			$scope.pubsGrid.ngGrid.$root.addClass("pubs-loading-indicator");

			//create array of listIds
			$scope.searchParms.listId = [];
			if($scope.selectedPubsLists && !$scope.advancedSearch) {
				for(var i in $scope.selectedPubsLists) {
					$scope.searchParms.listId.push($scope.selectedPubsLists[i].id);
				}
			}
			
			$scope.searchParms.page_size = $scope.pagingState.pageSize;

			var currentPage = $scope.pagingState.currentPage;
			$scope.searchParms.page_row_start = (currentPage - 1) * $scope.searchParms.page_size;
			PublicationFetcher.searchByTermAndListIds($scope.searchParms).then(function(httpPromise){
				$scope.pubs = httpPromise.data.records;
				$scope.recordCount = httpPromise.data.recordCount;
				$scope.selectedPubs.length = 0; //clear selections, for some reason, ngGrid/angular needs a reference to the original array to keep the watch valid
				$scope.pubsGrid.ngGrid.$root.removeClass("pubs-loading-indicator");
			});
			$scope.searchTerm = $scope.searchParms.q; //apply search term to scope so template updates
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
						});
						PubsModal.alert('Publication(s) added to the list(s)', msg, true);
						$scope.lists = [];
					},
					function(reason) {
						if (reason.status !== 401 && reason.status !== 403) {
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
							});
							PubsModal.alert('Publication(s) removed from the list "' + list.text + '"', msg, true);
							$scope.search();
						},
						function(reason) {
							if (reason.status !== 401 && reason.status !== 403) {
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

		$scope.pubsGrid = {
				data: 'pubs',
				selectedItems: $scope.selectedPubs,
				columnDefs: [
		            {field:'publicationType.text', displayName:'Type', width: 75 },
					{field:'seriesTitle.text', displayName:'USGS Series', width: 150 },
					{field:'seriesNumber', displayName:'Report Number', width: 125},
					{field:'publicationYear', displayName:'Year', width: 50},
					{field:'title', displayName:'Title'},
					{field:'contributors.authors[0].text', displayName:'First Author', width: 250 }
				],
				enableSorting: true,
				enableColumnResize: true,
				showFooter: true,
				totalServerItems: 'recordCount',
				enablePaging: true,
				pagingOptions: $scope.pagingState
	};

	//Watches to update pub list when list selection or paging settings change
	//To avoid double fetch on init, we short circuit the watch on selectedPubsLists during init
	$scope.$watch('pagingState', function (newVal, oldVal) {
		$scope.search();
	}, true);
	$scope.$watch('selectedPubsLists', function (newVal, oldVal) {
		if (newVal !== oldVal) {
			$scope.search();
		}
	}, true);

}]);
}) ();
