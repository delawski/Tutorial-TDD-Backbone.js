## Part 3: Creating Backbone.js View

**In the previous part of the series, we have created our first Backbone.js model using TDD principles.**

**The third and last part of the article is going to show you a process of developing a Backbone.js view, that will render the markup, handle the user input and reflect model’s state in the UI.
Of course, this time we will use the test-driven development principles as well.**

Just as it was with the `ControlColor` model, we will first write some tests in `tests/views/control-color.js` to make sure our view is defined and possesses Backbone-specific functions in its prototype:

```javascript
QUnit.module( 'views/control-color.js', function() {
  QUnit.test( 'Color control view exists and is Backbone view', function( assert ) {
     var View = window.ControlColorView;

     assert.ok( ! _.isUndefined( View ), 'View is defined' );
     assert.ok( _.isFunction( View.prototype.setElement ) && _.isFunction( View.prototype.delegateEvents ), 'View is Backbone view' );
  } );
} );
```

The tests are failing, so we’ll define the `ControlColorView` in the `src/views/control-color.js` file like:

```javascript
window.ControlColorView = Backbone.View.extend( {} );
```

From the **red** phase we rapidly moved to the **green** phase.
There’s nothing to **refactor** so far, so we’ll now take care of rendering the markup based on model’s state.

### Rendering the Markup in the View

Unit testing views is a bit more complex than testing models.
This is because of the fact that we have to provide a _context_ the view.
What I mean by _context_ is a dummy model to store the data (state) and a container living in a DOM, so that we’re able to test rendering and user interactions.

In our first unit test, after setting up the context, we will check if the DOM container has three checkboxes inside:

```javascript
QUnit.test( 'Color control view renders markup as expected', function( assert ) {
  var view, model;

  // Create container element in QUnit's fixture.
  jQuery( '#qunit-fixture' ).append( '<div class="control-color-container"></div>' );

  // Create dummy model.
  model = new Backbone.Model( {
     options: [ 'red', 'green', 'blue' ]
  } );

  // Create view and render it.
  view = new window.ControlColorView( {
     el:    '.control-color-container',
     model: model
  } );
  view.render();

  // Check the output.
  assert.equal( jQuery( '.control-color-container' ).find( 'input[type="checkbox"]' ).length, 3, 'view contains 3 checkboxes' );
} );
```

Of course, we haven’t defined a `render()` method, so we’re getting a failing (or **red**) test.
Let’s fix the test in the _simplest_ possible way:

```javascript
window.ControlColorView = Backbone.View.extend( {
  render: function() {
     _.times( 3, function() {
        this.$el.append( '<input type="checkbox">' );
     }, this );
  }
} );
```

I know it might seem like a joke, but actually we have satisfied our test condition.
The test is passing now, so it’s safe to say that we’ve gone through the **green** phase.
Let’s proceed to the **refactor** phase then.

As you may already know, appending elements to the DOM in a loop is generally a bad idea and considered as an anti-pattern. In order to minimize the performance hit in the browser, we should do DOM manipulation in batches, keeping the intermediate markup in the memory.

Let’s refactor our `render()` method, so that there is only one DOM operation per method call:

```javascript
render: function() {
  var items = [];
  _.times( 3, function() {
     items.push( '<input type="checkbox">' );
  }, this );
  this.$el.append( items );
}
```

_Et violà_! We append all three items at once, outside of the loop.
We can proceed to the next test.

At this stage our implementation doesn’t account for the re-rendering of the view.
Since checkboxes are always appended to the container and the old ones are not removed, we will get 6 items instead of 3 after re-rendering.
We can easily simulate such case by adding another `render()` call to our test and then checking if the number of checkboxes is 3 again:

```javascript
QUnit.test( 'Color control view renders markup as expected', function( assert ) {
  ...
  view.render();

  // Check the output.
  assert.equal( jQuery( '.control-color-container' ).find( 'input[type="checkbox"]' ).length, 3, 'view contains 3 checkboxes' );

  view.render();
  assert.equal( jQuery( '.control-color-container' ).find( 'input[type="checkbox"]' ).length, 3, 'view still contains 3 checkboxes after re-render' );
} );
```

Just as we predicted, instead of 3 we have 6 checkboxes.
Luckily, it’s pretty easy to fix this bug by adding an `empty()` method before appending:

```javascript
render: function() {
  var items = [];
  _.times( 3, function() {
     items.push( '<input type="checkbox">' );
  }, this );
  this.$el.empty().append( items );
}
```

The test is now passing now.
We can move on and write a new test to make sure that our checkboxes have proper values:

```javascript
QUnit.test( 'Checkboxes have correct values', function( assert ) {
  var view, model, values;

  jQuery( '#qunit-fixture' ).append( '<div class="control-color-container"></div>' );

  model = new Backbone.Model( {
     options: [ 'red', 'green', 'blue' ]
  } );

  view = new window.ControlColorView( {
     el:    '.control-color-container',
     model: model
  } );
  view.render();

  values = _.pluck( jQuery( '.control-color-container' ).find( 'input[type="checkbox"]' ), 'value' );
  assert.notOk( _.isEmpty( values ), 'there are values );
  assert.deepEqual( _.difference( values, [ 'red', 'green', 'blue' ] ), [], 'checkboxes values are as expected' );
} );
```

We’re using here the same method for comparing lists as when working on model’s implementation in the previous post of the series.

So that we have new **red** test case, we can proceed to the implementation and make the test **green** again:

```javascript
render: function() {
   var items = [];
   _.each( this.model.get( 'options' ), function( option ) {
      items.push( jQuery( '<input>', {
         type: 'checkbox',
         value: option
      } ) );
   }, this );
   this.$el.empty().append( items );
}
```

We have replaced static markup with actual checkboxes having values.
We’re good to go to the **refactor** phase.

The implementation itself seems to be reasonable, however our test code is not DRY enough.
We’re setting up the context in two tests cases identically:

```javascript
var view, model;

// Create container element in QUnit's fixture.
jQuery( '#qunit-fixture' ).append( '<div class="control-color-container"></div>' );

// Create dummy model.
model = new Backbone.Model( {
  options: [ 'red', 'green', 'blue' ]
} );

// Create view and render it.
view = new window.ControlColorView( {
  el:    '.control-color-container',
  model: model
} );
view.render();
```

Let’s simplify the code and move it to the QUnit’s `beforeEach()` method which is called before execution of each test.
Also, let’s move our basic tests for whether view is defined and is a Backbone.js view to the `beforeEach()` method too:

```javascript
QUnit.module( 'views/control-color.js', function( hooks ) {
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
        options: [ 'red', 'green', 'blue' ]
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
     assert.notOk( _.isEmpty( values ), 'there are values );
     assert.deepEqual( _.difference( values, [ 'red', 'green', 'blue' ] ), [], 'checkboxes values are as expected' );
  } );
} );
```

At this point, all tests are still **green** while the code became leaner and more readable.

###Implementing Checked Values

Our current view implementation renders checkboxes based on the `options` array from the related model.
What we need to do next is to set a `checked` state on those options that are listed in the model’s `checked` array.

We will first add a default `checked` list to the dummy model’s definition in the `beforeEach()` method:

```javascript
model = new Backbone.Model( {
  options: [ 'red', 'green', 'blue' ],
  checked: [ 'blue', 'red' ]
} );
```

Next, we can add a new test to our module:

```javascript
QUnit.test( 'Some checkboxes are checked based by default', function( assert ) {
  var checkedValues = _.pluck( container.find( 'input:checked' ), 'value' );
  assert.notOk( _.isEmpty( checkedValues ), 'there are checked inputs' );
  assert.deepEqual( _.difference( checkedValues, [ 'red', 'blue' ] ), [], 'correct checkboxes are checked' );
} );
```

We make the test back **green** by simply adding checked property in the `render()` method:

```javascript
window.ControlColorView = Backbone.View.extend( {
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
  }
} );
```

Our implementation and test code seem okay, so we’re skipping the **refactor** phase this time.

### Binding the View to the Model

Almost all parts of your control view are ready.
Now it’s time to couple the view and the model together.

First let’s make the view update itself on the model’s state change.
As usual, we start with a simple **red** test:

```javascript
QUnit.test( 'State of the view is bound to the model', function( assert ) {
  var checkedValues;
  view.model.set( 'checked', [ 'green' ] );
  checkedValues = _.pluck( container.find( 'input:checked' ), 'value' );
  assert.deepEqual( _.size( checkedValues ), 1, 'only 1 checkbox is checked' );
  assert.deepEqual( checkedValues, [ 'green' ], 'correct checkboxes is checked' );
} );
```

Right now we have no binding between the view and the model.
Let’s implement a simple update mechanism, so that each time model’s `checked` attribute changes, the view will be re-rendered:

```javascript
window.ControlColorView = Backbone.View.extend( {
  initialize: function() {
     this.listenTo( this.model, 'change:checked', this.render );
  },
  render: function() {
     ...
  }
} );
```

The test is passing now!
We could proceed to the refactor phase and e.g. implement a separate `update()` method that would just set/unset `checked` property on the already rendered inputs.
This way that whole view wouldn’t have to be re-rendered each time.
However, for the sake of simplicity of this post, we’ll skip this step.

The last thing that we have to do with the view is to wire up `change` event triggered by the user on the checkbox element with the model.

Let’s first simulate such scenario with a test case:

```javascript
QUnit.test( 'View sets attributes on the model', function( assert ) {
  container.find( 'input[value="red"]' ).prop( 'checked', false ).trigger( 'change' );
  assert.deepEqual( view.model.get( 'checked' ), [ 'blue' ], 'only 1 checkbox is checked now' );
} );
```

We have to manually set the `checked` property on an input and then trigger a `change` event.
This way we are simulating the browser behaviour on a user action.

To make the test pass, we will add an `events` object to the view and a change handler:

```javascript
window.ControlColorView = Backbone.View.extend( {
  events: {
     'change input[type="checkbox"]': 'handleChange'
  },
  initialize: function() {
     ...
  },
  render: function() {
     ...
  },
  handleChange: function() {
     var checked = _.pluck( this.$( 'input[type="checkbox"]:checked' ), 'value' );
     this.model.set( 'checked', checked );
  }
} );
```

In the `handleChange()` method we are getting a list of values of all checked inputs in the view with Underscore’s `_.pluck()` method.
Next, we simply set this list on the model.

At this point all our tests are **green**.
We should now refactor (e.g. cache input jQuery objects in the `render()` method and then use them in the `handleChange()` method) but we will skip this step again.

In the last part of the series we have created a Backbone.js view to represent the state of the model in the UI and to handle user actions.

### Summary

Following test-driven development principles might seem tedious and time-consuming at first, but in a long run it really pays off. The code written this way is well covered by unit tests making the developer pretty confident in what he has just created. Also, the development process itself should become more enjoyable and fun.