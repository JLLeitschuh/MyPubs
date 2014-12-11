(function() {


angular.module('pw.links',['pw.lookups', 'pw.dataList'])

    .controller('linksCtrl',
	['$scope', 'LookupFetcher', 'ListOrderingService', function($scope, LookupFetcher, ListOrderingService) {

		var getEmptyLink = function() {
		    return {
			id : '',
			type : {},
			url : '',
			text : '',
			size : '',
			linkFileType : {},
			description : ''
		    };
		};

		if (angular.isUndefined($scope.pubData.links)) {
		    $scope.pubData.links = [];
		}
		$scope.pubData.links = _.sortBy($scope.pubData.links, 'rank');

		// Fetch the link lookups for link type and file type
		LookupFetcher.promise('linktypes').then(function(response) {
		    $scope.linkTypeOptions = response.data; //[{id : 1, text: 'Text1'}];//response.data;
		});
		LookupFetcher.promise('linkfiletypes').then(function(response) {
		    $scope.fileTypeOptions = response.data;//[{id : 1, text : 'Text2'}]; //response.data;
		});

		$scope.sortOptions = {
		    stop : function(e, ui) {
			ListOrderingService.updateRank($scope.pubData.links);
		    }
		};

		$scope.addNewLink = function() {
		    ListOrderingService.addNewObj($scope.pubData.links, getEmptyLink());
		    $('html, body').animate({scrollTop:$(document).height()}, 'slow');
		};

		$scope.deleteLink = function(index) {
		    ListOrderingService.deleteObj($scope.pubData.links, index);
		};
	}]);
}) ();
