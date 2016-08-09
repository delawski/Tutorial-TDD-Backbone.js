/* global _, QUnit, Backbone, jQuery */
/**
 * Test color control view.
 */
QUnit.module( 'views/control-color.js', function( hooks ) {
	'use strict';

	var view, container,
		$ = jQuery,
		fixture = $( '#qunit-fixture' );

	hooks.beforeEach( function( assert ) {
		var View, model;

		// Test if view is defined and is a Backbone.js view.
		View = window.ControlColorView;
		assert.ok( ! _.isUndefined( View ), 'View is defined' );
		assert.ok( _.isFunction( View.prototype.setElement ) && _.isFunction( View.prototype.delegateEvents ), 'View is Backbone view' );

		// Create container element in QUnit's fixture.
		container = $( '<div class="control-color-container"></div>' );
		fixture.append( container );

		// Create dummy model.
		model = new Backbone.Model( {
			options: [ 'red', 'green', 'blue' ],
			checked: [ 'blue', 'red' ]
		} );

		// Create view and render it.
		view = new View( {
			el:    '.control-color-container',
			model: model
		} );
		view.render();
	} );

	QUnit.test( 'Color control view renders markup as expected', function( assert ) {
		assert.equal( container.find( 'input[type="checkbox"]' ).length, 3, 'view contains 3 checkboxes' );

		view.render();
		assert.equal( container.find( 'input[type="checkbox"]' ).length, 3, 'view still contains 3 checkboxes after re-render' );
	} );

	QUnit.test( 'Checkboxes have correct values', function( assert ) {
		var values = _.pluck( container.find( 'input[type="checkbox"]' ), 'value' );
		assert.notOk( _.isEmpty( values ), 'there are checkboxes' );
		assert.deepEqual( _.difference( values, [ 'red', 'green', 'blue' ] ), [], 'checkboxes values are as expected' );
	} );

	QUnit.test( 'Some checkboxes are checked based by default', function( assert ) {
		var checkedValues = _.pluck( container.find( 'input:checked' ), 'value' );
		assert.notOk( _.isEmpty( checkedValues ), 'there are checked inputs' );
		assert.deepEqual( _.difference( checkedValues, [ 'red', 'blue' ] ), [], 'correct checkboxes are checked' );
	} );

	QUnit.test( 'State of the view is bound to the model', function( assert ) {
		var checkedValues;
		view.model.set( 'checked', [ 'green' ] );
		checkedValues = _.pluck( container.find( 'input:checked' ), 'value' );
		assert.deepEqual( _.size( checkedValues ), 1, 'only 1 checkbox is checked' );
		assert.deepEqual( checkedValues, [ 'green' ], 'correct checkboxes is checked' );
	} );

	QUnit.test( 'View sets attributes on the model', function( assert ) {
		container.find( 'input[value="red"]' ).prop( 'checked', false ).trigger( 'change' );
		assert.deepEqual( view.model.get( 'checked' ), [ 'blue' ], 'only 1 checkbox is checked now' );
	} );
} );
