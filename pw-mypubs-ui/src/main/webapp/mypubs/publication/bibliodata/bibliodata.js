(function () {


	angular.module('pw.bibliodata', ['pw.lookups'])
		.controller('biblioCtrl', [
			'$scope', '$filter', '$q', 'LookupFetcher', 'LookupCascadeSelect2', '$routeParams',
			function ($scope, $filter, $q, LookupFetcher, LookupCascadeSelect2, $routeParams) {

				// This are used to control whether the change* functions are executed.
				// We don't want them to execute the first time it is fired when publication
				// data has been loaded.
				var typeInputIsInitialized = false;
				var genreInputIsInitialized = false;
				var largerWorkTypeInputIsInitialized = false;

				if (!$routeParams.pubsid) {
					typeInputIsInitialized = true;
					genreInputIsInitialized = true;
				}
				//@mbucknell recommends binding ui-select2 ng-model targets to variables
				//on the local-most scope and propagating changes back up to pubData via watches
				$scope.localPubTypeId = $scope.pubData.publicationType.id;
				$scope.localPubGenreId = $scope.pubData.publicationSubtype.id;
				$scope.localSeriesTitle = $scope.pubData.seriesTitle.id;
				$scope.localCostCenters = [];
				angular.forEach($scope.pubData.costCenters, function (costCenter) {
					if (angular.isDefined(costCenter.id)) {
						$scope.localCostCenters.push(costCenter.id);
					}
				});
				$scope.localLargerWorkTypeId = $scope.pubData.largerWorkType.id;
				$scope.localLargerWorkSubtypeId = $scope.pubData.largerWorkSubtype.id;

				// This method and the watches on the select2 local values gets around an issue where you
				// have to initialize the select2 with an id value, but then it puts an object on the associated
				// scope object.
				var updateObject = function(obj, value) {
					if (angular.isObject(value)) {
						return value;
					}
					else if (obj.id !== value) {
						return {id: value, text: ''};
					}
					else {
						return {id: obj.id, text : obj.text};
					}
				};
				var getObject = function(value) {
					if (angular.isObject(value)) {
						return value;
					}
					else {
						return {id : value};
					}
				};

				$scope.$watch('localPubTypeId', function (value) {
					$scope.pubData.publicationType = updateObject($scope.pubData.publicationType, value);
				});
				$scope.$watch('localPubGenreId', function (value) {
					$scope.pubData.publicationSubtype = updateObject($scope.pubData.publicationSubtype, value);
				});
				$scope.$watch('localSeriesTitle', function (value) {
					$scope.pubData.seriesTitle = updateObject($scope.pubData.seriesTitle, value);
				});

				$scope.changeType = function () {
					if (typeInputIsInitialized) {
						$scope.localPubGenreId = '';
						$scope.localSeriesTitle = '';
					}
					else {
						typeInputIsInitialized = true;
					}
				};

				$scope.changeGenre = function () {
					if (genreInputIsInitialized) {
						$scope.localSeriesTitle = '';
					}
					else {
						genreInputIsInitialized = true;
					}
				};

				// It's ok not to update the costCenter text field since all of the cost center options are loaded
				// at initialization.
				$scope.$watch('localCostCenters', function (newCostCenters) {
					$scope.pubData.costCenters = _.map(newCostCenters, function (costCenterId) {
						return {id: costCenterId};
					});
				});

				$scope.$watch('localLargerWorkTypeId', function (value) {
					$scope.pubData.largerWorkType = updateObject($scope.pubData.largerWorkType, value);
				});
				$scope.$watch('localLargerWorkSubtypeId', function (value) {
					$scope.pubData.largerWorkSubtype = updateObject($scope.pubData.largerWorkSubtype, value);
				});
				$scope.changeLargerWorkType = function () {
					if (largerWorkTypeInputIsInitialized) {
						$scope.localLargerWorkSubtypeId = '';
					}
					else {
						largerWorkTypeInputIsInitialized = true;
					}
				};
				// Set up select2 lists and/or options to retrieve lists dynamically
				LookupFetcher.promise('publicationtypes').then(function (response) {
					$scope.typeOptions = response.data;

				});

				LookupFetcher.promise('costcenters', {active : 'y'}).then(function(response) {
					$scope.activeCostCenterOptions = response.data;
				});
				LookupFetcher.promise('costcenters', {active : 'n'}).then(function(response) {
					$scope.notActiveCostCenterOptions = response.data;
				});

				$scope.subtypeSelect2Options = {
					query: function (query) {
						LookupCascadeSelect2.query(query, 'publicationsubtypes', {publicationtypeid: $scope.pubData.publicationType.id});
					},
					initSelection: function (element, callback) {
						callback($scope.pubData.publicationSubtype);
					},
					placeholder: 'Select a publication subtype',
					allowClear: true
				};

				$scope.seriesTitleSelect2Options = {
					query : function(options) {
						var activePromise, notActivePromise;
						var activeResults = {text : 'Active', children : []};
						var notActiveResults = {text : 'Not Active', children : []};

						activePromise = LookupFetcher.promise('publicationseries', {
							publicationsubtypeid : $scope.pubData.publicationSubtype.id,
							active : 'y',
							text : options.term
						}).then(function(response) {
							activeResults.children = $filter('limitTo')(response.data, 30);
						});
						notActivePromise = LookupFetcher.promise('publicationseries', {
							publicationsubtypeid : $scope.pubData.publicationSubtype.id,
							active : 'n',
							text : options.term
						}).then(function(response) {
							notActiveResults.children = $filter('limitTo')(response.data, 30);
						});

						$q.all([activePromise, notActivePromise]).then(function() {
							options.callback({results : [activeResults, notActiveResults]});
						});
					},
					initSelection : function(element, callback) {
						callback($scope.pubData.seriesTitle);
					},
					minimumInputLength : 1,
					placeholder: 'Select a series',
					allowClear : true
				};
				$scope.costCenterSelect2Options = {
					placeholder: 'Select one or more cost centers'
				};

				$scope.largerWorkSubtypeSelect2Options = {
					query : function(query) {
						LookupCascadeSelect2.query(query, 'publicationsubtypes', {publicationtypeid : $scope.pubData.largerWorkType.id});
					},
					initSelection : function(element, callback) {
						LookupCascadeSelect2.initSelection('publicationsubtypes', {publicationtypeid: $scope.pubData.largerWorkType.id}, $scope.pubData.largerWorkSubtype.id, callback);
					},
					placeholder : 'Select a larger work subtype',
					allowClear : true
				};

				$scope.docAbstractEditorOptions = {
					menubar: false,
					plugins : 'code link paste',
					formats: {
    						italic: {inline: 'i'}
  						},
					browser_spellcheck : true,
					toolbar : 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | subscript superscript | link | code',
					valid_elements : "@[id|class|title|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|"
							+ "onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|"
							+ "onkeydown|onkeyup],a[rel|rev|charset|hreflang|tabindex|accesskey|type|"
							+ "name|href|target|title|class|onfocus|onblur],strong/b,i/em,strike,u,"
							+ "#p,-ol[type|compact],-ul[type|compact],-li,br,img[longdesc|usemap|"
							+ "src|border|alt=|title|hspace|vspace|width|height|align],-sub,-sup,"
							+ "-blockquote,-table[border=0|cellspacing|cellpadding|width|frame|rules|"
							+ "height|align|summary|bgcolor|background|bordercolor],-tr[rowspan|width|"
							+ "height|align|valign|bgcolor|background|bordercolor],tbody,thead,tfoot,"
							+ "#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor"
							+ "|scope],#th[colspan|rowspan|width|height|align|valign|scope],caption,-div,"
							+ "-span,-code,-pre,address,-h1,-h2,-h3,-h4,-h5,-h6,hr[size|noshade],-font[face"
							+ "|size|color],dd,dl,dt,cite,abbr,acronym,del[datetime|cite],ins[datetime|cite],"
							+ "object[classid|width|height|codebase|*],param[name|value|_value],embed[type|width"
							+ "|height|src|*],script[src|type],map[name],area[shape|coords|href|alt|target],bdo,"
							+ "button,col[align|char|charoff|span|valign|width],colgroup[align|char|charoff|span|"
							+ "valign|width],dfn,fieldset,form[action|accept|accept-charset|enctype|method],"
							+ "input[accept|alt|checked|disabled|maxlength|name|readonly|size|src|type|value],"
							+ "kbd,label[for],legend,noscript,optgroup[label|disabled],option[disabled|label|selected|value],"
							+ "q[cite],samp,select[disabled|multiple|name|size],small,"
							+ "textarea[cols|rows|disabled|name|readonly],tt,var,big"
				};

				$scope.tableOfContentsEditorOptions = {
						menubar: false,
						plugins : 'code link paste',
						formats: {
	    						italic: {inline: 'i'}
	  						},
						browser_spellcheck : true,
						toolbar : 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | subscript superscript | link | code'
					};

			}]);

})();
