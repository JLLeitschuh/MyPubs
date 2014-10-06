describe("pw.auth module", function() {
	//set global constant
	APP_CONFIG = {
			endpoint: 'http://servicesUrl.com/pubs-service/'
	};
	var AUTH_SERVICE_PATH = 'auth/ad/token';
	var LOGOUT_SERVICE_PATH = 'auth/logout';

	var AD_TOKEN_URL = APP_CONFIG.endpoint + AUTH_SERVICE_PATH;
	var LOGOUT_URL = APP_CONFIG.endpoint + LOGOUT_SERVICE_PATH;

	describe("AuthState and AuthService services", function() {
		var authService, authState, rootScope, authorizationInterceptor, httpBackend, locationMock, cookiesMock, scope, q;

		beforeEach(function () {
			locationMock = {
					path : function(newPath) {}
			};
			spyOn(locationMock, 'path').andCallThrough();

			cookiesMock = {};

			module('pw.auth', function($provide) {
				// location mock
				$provide.value('$location', locationMock);
				$provide.value('$cookies', cookiesMock);
				$provide.value('APP_CONFIG', APP_CONFIG);
			});

			inject(['AuthService', 'AuthState', 'AuthorizationInterceptor', '$httpBackend', '$rootScope', '$q', function(AuthService, AuthState, AuthorizationInterceptor, $httpBackend, $rootScope, $q) {
				authService = AuthService;
				authState = AuthState;
				authorizationInterceptor = AuthorizationInterceptor
				httpBackend = $httpBackend;
				rootScope = $rootScope;
				q = $q;
				spyOn(q, 'reject');
			}]);

			//no http calls pending when we first start
			httpBackend.verifyNoOutstandingExpectation();
			httpBackend.verifyNoOutstandingRequest();
		});

		afterEach(function() {
			httpBackend.verifyNoOutstandingExpectation();
			httpBackend.verifyNoOutstandingRequest();
		});

		it("AuthService contains these API functions", function (){
			expect(authService.getNewTokenPromise).toBeDefined();
			expect(authService.logout).toBeDefined();
		});

		it("AuthState contains these API functions", function (){
			expect(authState.getToken).toBeDefined();
			expect(authState.setToken).toBeDefined();
			expect(authState.clearToken).toBeDefined();
		});

		it("AuthService.getNewTokenPromise will do an ajax call to a auth service to get a token " +
				"and then use AuthState to store the token", function (){
			//set up server responses
			var testToken = "auth-token";
			httpBackend.whenPOST(AD_TOKEN_URL).respond({ token: testToken});

			//first call results in a fetch to token server
			var token;
			authService.getNewTokenPromise("user", "pass").then(function(token) {
				expect(authState.getToken()).toBe(testToken);
				expect(token).toBe(testToken);
				expect(cookiesMock.myPubsAuthToken).toBe(testToken);
			}, function(reason){
				expect(true).toBe(false);
			});
			httpBackend.expectPOST(AD_TOKEN_URL, "username=user&password=pass");
			httpBackend.flush();
			rootScope.$digest();
		});

		it("AuthState.getToken gets the token from a browser cookie if it exists and AuthState.clearCookie clears all tokens", function (){
			var testToken = "auth-token";
			var testCookieToken = "token-from-cookie";

			//returns null if nothing was set and all places a token could be are null
			expect(authState.getToken()).toBe(null);
			expect(cookiesMock.myPubsAuthToken).toBeUndefined();
			expect(authState.loginState.authToken).toBe(null);

			//set cookie to mimic already existing in browser
			cookiesMock.myPubsAuthToken = testCookieToken;
			expect(authState.getToken()).toBe(testCookieToken); //shows cookie was found in just the cookie
			expect(authState.loginState.authToken).toBe(testCookieToken); //shows we loaded the cookie token into memory

			authState.clearToken();
			expect(authState.getToken()).toBe(null);
			expect(authState.loginState.authToken).toBe(null);

			//set up server responses
			httpBackend.whenPOST(AD_TOKEN_URL).respond({ token: testToken });
			authService.getNewTokenPromise("user", "pass").then(function(token) {
				expect(authState.getToken()).toBe(testToken); //not the previous cookie token
				expect(cookiesMock.myPubsAuthToken).toBe(testToken); //not the previous cookie token
				expect(authState.loginState.authToken).toBe(testToken); //not the previous cookie token
			}, function(reason){
				expect(true).toBe(false);
			});
			httpBackend.flush();
		});

		it("AuthService.logout calls a token invalidation service then calls AuthState.clearToken", function (){
			//first log in
			var testToken = "auth-token";
			httpBackend.whenPOST(AD_TOKEN_URL).respond({token: testToken});
			authService.getNewTokenPromise("user", "pass").then(function(token) {
				expect(token).toBe(testToken);
				expect(cookiesMock.myPubsAuthToken).toBe(testToken);
			}, function(reason){
				expect(true).toBe(false);
			});
			httpBackend.expectPOST(AD_TOKEN_URL, "username=user&password=pass");
			httpBackend.flush();

			httpBackend.whenPOST(LOGOUT_URL).respond("Logged out"); //TODO check for 200?
			authService.logout();
			httpBackend.expectPOST(LOGOUT_URL);
			httpBackend.flush();

			expect(cookiesMock.myPubsAuthToken).toBeFalsy();
			expect(authState.loginState.authToken).toBeFalsy();
			expect(locationMock.path).toHaveBeenCalledWith('/Login');
		});

		it("AuthorizationInterceptor properly updates requests with Authorization header", function(){
			var requestConfig = {
				headers: {}
			};
			authorizationInterceptor.request(requestConfig);
			expect(requestConfig.headers['Authorization']).toBeUndefined(); //if no token exists, header not set

			//set up server responses
			var testToken = "auth-token";
			httpBackend.whenPOST(AD_TOKEN_URL).respond({token: testToken});

			//first call results in a fetch to token server
			authService.getNewTokenPromise("user", "pass").then(function(token) {
				authorizationInterceptor.request(requestConfig);
				//interceptor updates config object with authorization header
				expect(requestConfig.headers['Authorization']).toBe("Bearer " + testToken);
			}, function(reason){
				expect(true).toBe(false);
			});
			httpBackend.expectPOST(AD_TOKEN_URL, "username=user&password=pass");
			httpBackend.flush();
		});

		it("AuthorizationInterceptor properly handles 401 responses", function(){
			var notFoundResponse = { status: 404 };
			var unauthorizedResponse = { status: 401 };
			authorizationInterceptor.responseError({ status: 404});
			expect(q.reject).toHaveBeenCalledWith(notFoundResponse); //normal reject response

			authorizationInterceptor.responseError({ status: 401});
			expect(locationMock.path).toHaveBeenCalledWith('/Login'); //forward to login screen
		});
	});
});