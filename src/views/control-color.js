/* global _, Backbone */
( function() {
	'use strict';

	/**
	 * Color control view implementation.
	 */
	window.ControlColorView = Backbone.View.extend( {
		/**
		 * Event listeners.
		 * @type {object}
		 */
		events: {
			'change input[type="checkbox"]': 'handleChange'
		},

		/**
		 * Constructor/initialize the view.
		 * @constructor
		 * @returns {void}
		 */
		initialize: function() {
			this.listenTo( this.model, 'change:checked', this.render );
		},

		/**
		 * Render the view.
		 * @returns {void}
		 */
		render: function() {
			var items = [],
				checked = this.model.get( 'checked' );

			_.each( this.model.get( 'options' ), function( option ) {
				items.push( jQuery( '<input>', {
					type:    'checkbox',
					value:   option,
					checked: _.contains( checked, option )
				} ) );
			}, this );

			this.$el.empty().append( items );
		},

		/**
		 * Change event handler.
		 * @returns {void}
		 */
		handleChange: function() {
			var checked = _.pluck( this.$( 'input[type="checkbox"]:checked' ), 'value' );
			this.model.set( 'checked', checked );
		}
	} );
} )();