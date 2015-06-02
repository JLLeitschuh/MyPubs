describe("Javascript importing", function() {
	//this is only imported during and required for testing
	it("loads sinon library for testing support", function() {
		expect(sinon).toBeDefined();
	});

	it("loads jQuery library", function() {
		expect(jQuery).toBeDefined();
	});

	it("loads jQuery simulate library", function() {
		expect(jQuery.simulate).toBeDefined();
	});

	it("loads underscore.js library", function() {
		expect(_).toBeDefined();
	});

	it("loads select2 library", function() {
		expect(Select2).toBeDefined();
	});

	it("loads tinymce library", function() {
		expect(tinymce).toBeDefined();
	});

	it("loads Angular library", function() {
		expect(angular).toBeDefined();
	});

	it("loads Angular Mocks library", function() {
		expect(angular.mock).toBeDefined();
	});

	it("loads Angular route library", function() {
		expect( angular.module('ngRoute') ).toBeDefined();
	});

	it("loads Angular bootstrap library", function() {
		expect( angular.module('ui.bootstrap') ).toBeDefined();
	});

	it("loads Angular select2 library", function() {
		expect( angular.module('ui.select2') ).toBeDefined();
	});

	it("loads Angular tinymce library", function() {
		expect( angular.module('ui.tinymce') ).toBeDefined();
	});

});
