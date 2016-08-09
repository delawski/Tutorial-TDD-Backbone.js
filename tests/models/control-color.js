/* global _, QUnit */
/**
 * Test color control model.
 */
QUnit.module( 'models/control-color.js', function() {
	'use strict';

	QUnit.test( 'Color control exists and is Backbone model', function( assert ) {
		var Model = window.ControlColor;

		assert.ok( ! _.isUndefined( Model ), 'model is defined' );
		assert.ok( _.isFunction( Model.prototype.fetch ) && _.isFunction( Model.prototype.sync ), 'model is Backbone model' );
	} );

	QUnit.test( 'Model has required properties', function( assert ) {
		var model = new window.ControlColor();

		assert.ok( model.has( 'options' ), 'model has "options" property' );
		assert.ok( _.isArray( model.get( 'options' ) ), '"options" is array' );

		assert.ok( model.has( 'checked' ), 'model has "checked" options property' );
		assert.ok( _.isArray( model.get( 'checked' ) ), '"checked" options is array' );

		assert.ok( _.contains( model.get( 'options' ), 'all' ), 'options property contains "all" option' );
	} );

	QUnit.test( 'Model is instantiated with correct options', function( assert ) {
		var model, options;

		model = new window.ControlColor( {
			options: [ 'red', 'green', 'blue' ]
		} );
		options = model.get( 'options' );

		assert.notOk( _.isEmpty( options ), '"options" is not empty' );
		assert.deepEqual( _.difference( options, [ 'all', 'red', 'green', 'blue' ] ), [], '"options" array match the expectations' );
	} );

	QUnit.test( 'Checked array is handled properly', function( assert ) {
		var model;

		model = new window.ControlColor();
		assert.deepEqual( model.get( 'checked' ), [ 'all' ], '"all" option is checked by default' );

		model = new window.ControlColor( {
			checked: [ 'red', 'green' ]
		} );
		assert.notOk( _.isEmpty( model.get( 'checked' ) ), '"checked" is not empty' );
		assert.deepEqual( _.difference( model.get( 'checked' ), [ 'red', 'green' ] ), [], 'default options are checked as expected' );

		model.set( 'checked', [ 'all', 'red', 'green' ] );
		assert.deepEqual( model.get( 'checked' ), [ 'all' ], '"all" option unchecks other ones' );

		model.set( 'checked', [ 'all', 'blue' ] );
		assert.deepEqual( model.get( 'checked' ), [ 'blue' ], '"all" option is removed if it is passed once again' );
	} );

} );
