(function() {
    var mod = angular.module('pw.dataList', []);

    mod.factory('ListOrderingService', function() {
	// The service assumes that the list objects contain a property, rank, which
	// indicates the ordering of the list.
	var srv = {};

	/*
	 * @param list - Array of objects with each object containing a rank property
	 */
	srv.updateRank = function(list) {
	    var i;
	    for (i = 0; i < list.length; i++) {
		list[i].rank = i + 1;
	    }
	};

	/*
	 * @param list - Array of objects with each object containing a rank property
	 * @param newEmptyObj - Object which will be appended to list with the rank property set to the correct position in the list.
	 */
	srv.addNewObj = function(list, newEmptyObj) {
	    var result = list;
	    if (result.length === 0) {
			newEmptyObj.rank = 1;
	    }
	    else {
			newEmptyObj.rank = _.max(list, function(obj) { return obj.rank; }).rank + 1;
	    }
	    result.push(newEmptyObj);
	    return result.concat([]);
	};

	/*
	 * @param list - Array of objects with each object containing a rank property
	 * @param index - position in list of object to remove
	 */
	srv.deleteObj = function(list, index) {
	    list.splice(index, 1);
	    srv.updateRank(list);
	};

	return srv;
    });

    mod.directive('pwDataListRow', function() {
	// The onDelete attribute should be a function which removes the row from the DOM and scope.
		return {
			restrict : 'E',
			transclude : true,
			templateUrl : 'mypubs/dataList/data_list_row.html',
			scope: {
			'delete' : '&onDelete'
			}
		};
    });
})();


