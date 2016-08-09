/* global _, Backbone */
( function() {
	'use strict';

	/**
	 * Color control model implementation.
	 */
	window.ControlColor = Backbone.Model.extend( {
		/**
		 * Define default values.
		 * @type {object}
		 */
		defaults: {
			options: [],
			checked: [ 'all' ]
		},

		/**
		 * Constructor/initialize the model.
		 * @constructor
		 * @param {object} attrs Input attributes.
		 * @returns {void}
		 */
		initialize: function( attrs ) {
			attrs = _.defaults( attrs || {}, this.defaults );
			attrs.options.push( 'all' );

			this.on( 'change:checked', this.updateChecked );
		},

		/**
		 * Update `checked` array values.
		 *
		 * @param {object} model The model.
		 * @param {array} checked Checked array.
		 * @returns {void}
		 */
		updateChecked: function( model, checked ) {
			var itemsToCheck;

			if ( _.contains( checked, 'all' ) ) {
				if ( _.contains( this.previous( 'checked' ), 'all' ) ) {
					itemsToCheck = _.without( checked, 'all' );
				} else {
					itemsToCheck = [ 'all' ];
				}
				this.set( 'checked', itemsToCheck, { silent: true } );
			}
		}
	} );
} )();
