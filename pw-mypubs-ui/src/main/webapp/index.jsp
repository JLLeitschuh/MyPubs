<%@page contentType="text/html" pageEncoding="UTF-8"%>
<html ng-app="pw.mypubs">
<head>

	<title>MyPubs 2.0</title>

	<link rel="icon" type="img/x-icon" href="favicon.ico">
	<link rel="shortcut icon" type="img/x-icon" href="favicon.ico">
	
	<link rel="stylesheet" type="text/css" href="webjars/ng-grid/2.0.11/ng-grid.min.css" />

    <link rel="stylesheet" type="text/css" href="webjars/bootstrap/3.2.0/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="lib/angular-bootstrap-datetimepicker/css/datetimepicker.css">
    <link rel="stylesheet" type="text/css" href="lib/select2/select2.css">
    <link rel="stylesheet" type="text/css" href="lib/select2/select2-bootstrap.css">
	<link rel="stylesheet" type="text/css" href="lib/font-awesome-4.1.0/css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="mypubs/main/mypubs.css">
	<link rel="stylesheet" type="text/css" href="mypubs/main/header.css">
	<link rel="stylesheet" type="text/css" href="mypubs/publication/publication.css">
	<link rel="stylesheet" type="text/css" href="mypubs/publication/contributors/contributor.css">
	<link rel="stylesheet" type="text/css" href="mypubs/publication/links/links.css">
    <link rel="stylesheet" type="text/css" href="css/custom.css">

</head>

<body>

	<div id="main" class="container">

		<div class="navbar navbar-fixed-top banner-area">
			<a class="navbar-brand" href="http://usgs.gov" target="_new">
				<img alt="USGS" src="mypubs/main/img/usgslogo-40.png"></img>
			</a>
			<a class="navbar-brand" href="http://cida.usgs.gov" target="_new" title="Center for Integrated Data Analytics">
				<img alt="CIDA" src="mypubs/main/img/cidalogo-40.png"></img>
			</a>

			<div id="ccsa-area">
				<a href="http://www.usgs.gov/" title="Link to main USGS page">USGS Home</a>
				<a href="http://www.usgs.gov/ask/index.html" title="Link to main USGS contact page">Contact USGS</a>
				<a href="http://search.usgs.gov/" title="Link to main USGS search (not publications search)">Search USGS</a>
			</div>
		</div>


		<div class="container mainContainer" ng-controller="mainCtrl">	    

			<div class="row">
				<div id="logout-div" class="pull-right">
					<button type="button" class="btn btn-link" ng-click="logout()">Logout</button>
				</div>

				<div class="col-lg-12">

					<pw:notify></pw:notify>

					<div ng-view id="view"></div>

				</div>
			</div>
		</div>

	</div>
	
	
    <jsp:include page="constants.jsp"></jsp:include>

	<!-- lib dependencies -->
	
	<script type="text/javascript" src="webjars/jquery/1.11.1/jquery.min.js"></script>
	<script type="text/javascript" src="lib/jquery-ui-1.11.0.custom/jquery-ui.js"></script>
	<script type="text/javascript" src="lib/underscore/underscore.1.6.0.js"></script>
	<script type="text/javascript" src="lib/select2/select2.3.4.8.js"></script>
	<script type="text/javascript" src="lib/tinymce/tinymce.4.1.0.min.js"></script>

	<script type="text/javascript" src="webjars/angularjs/1.2.23/angular.min.js"></script>
	<script type="text/javascript" src="webjars/ng-grid/2.0.11/ng-grid.min.js"></script>
	<script type="text/javascript" src="webjars/angularjs/1.2.23/angular-route.min.js"></script>
	<script type="text/javascript" src="webjars/angularjs/1.2.23/angular-animate.min.js"></script>
	<script type="text/javascript" src="webjars/angularjs/1.2.23/angular-cookies.min.js"></script>
	<script type="text/javascript" src="lib/angular/ui-select2.js"></script>
	<script type="text/javascript" src="lib/angular/ui-bootstrap-tpls-0.11.0.js"></script>
	<script type="text/javascript" src="lib/angular/ui-tinymce.0.5.x.js"></script>
	<script type="text/javascript" src="lib/ui-sortable-master/src/sortable.js"></script>
	<script type="text/javascript" src="webjars/momentjs/2.8.1/min/moment.min.js"></script>
	<script type="text/javascript" src="webjars/bootstrap/3.2.0/js/bootstrap.min.js"></script>
	<script type="text/javascript" src="lib/angular-bootstrap-datetimepicker/js/datetimepicker.js"></script>
	<script type="text/javascript" src="lib/geojsonhint-master/geojsonhint.js"></script>

	<!-- mypubs application utils -->
     
	<script type="text/javascript" src="mypubs/dataList/dataList.js"></script>
	<script type="text/javascript" src="mypubs/notify/notify.js"></script>
	<script type="text/javascript" src="mypubs/modal/modal.js"></script>
	
	<script type="text/javascript" src="mypubs/services/lookups.js"></script>
	<script type="text/javascript" src="mypubs/services/contributorDAO.js"></script>
	<script type="text/javascript" src="mypubs/services/publicationDAO.js"></script>
	<script type="text/javascript" src="mypubs/services/pubsListDAO.js"></script>

	<!-- login page -->
	<script type="text/javascript" src="mypubs/auth/auth.js"></script>

	<!-- search page -->
	<script type="text/javascript" src="mypubs/search/search.js"></script>
	
	<!-- edit contributor page -->
	<script type="text/javascript" src="mypubs/contributor/editContributor.js"></script>

	<!-- publications page -->

	<script type="text/javascript" src="mypubs/publication/publication.js"></script>

	<!-- publications tabs -->
	<script type="text/javascript" src="mypubs/publication/bibliodata/bibliodata.js"></script>
	<script type="text/javascript" src="mypubs/publication/catalog/catalog.js"></script>
	<script type="text/javascript" src="mypubs/publication/spn/spn.js"></script>
	<script type="text/javascript" src="mypubs/publication/links/links.js"></script>
	<script type="text/javascript" src="mypubs/publication/geo/geo.js"></script>
	<script type="text/javascript" src="mypubs/publication/contributors/contributor.js"></script>
	
		<!-- main controller -->
	<script type="text/javascript" src="mypubs/main/mypubs.js"></script>


</body>
</html>
