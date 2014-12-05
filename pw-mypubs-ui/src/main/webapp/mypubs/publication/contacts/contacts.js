(function() {


angular.module('pw.contacts', [])
	.controller('contactsCtrl', [
		'$scope',
		function($scope) {
			$scope.contactsEditorOptions = {
					menubar: false,
					plugins : 'code link paste',
					formats: {
    						italic: {inline: 'i'}
  						},
					browser_spellcheck : true,
					toolbar : 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | subscript superscript | link | code'
				};
		}
	]);
}) ();