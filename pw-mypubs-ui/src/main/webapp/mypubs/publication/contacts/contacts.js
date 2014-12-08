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
					toolbar : 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | subscript superscript | link | code',
					valid_elements : "strong/b,i/em,strike,u,"
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
							+ "valign|width],dfn,fieldset,"
							+ "kbd,label[for],legend,noscript,"
							+ "q[cite],samp,small,"
							+ "tt,var,big"
				};
		}
	]);
}) ();