/* eslint-env node */
/* eslint strict: ["safe", "global"] */
'use strict';

var gulp = require( 'gulp' ),
	qunit = require( 'node-qunit-phantomjs' );

gulp.task( 'test', function() {
	qunit( 'tests/test-runner.html', {
		verbose: true
	} );
} );

gulp.task( 'watch', function() {
	gulp.watch( [ 'src/**/*', 'tests/**/*' ], [ 'test' ] );
} );
