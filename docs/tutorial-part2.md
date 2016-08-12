Part 2: Implementing Backbone.js Model
===

**In the first part of the series I walked you through the test-driven development concepts.
Then we have set up the project workspace, including a QUnit test runner and an empty source files accompanied with test files.**

**In the second part of the article, we will create our first Backbone.js model using TDD principles.**

Early on in the project I decided to use the [Backbone.js](http://backbonejs.org/) library and build our `ControlColor` component on top of it.
In this case, first, we have to make sure that we’re dealing with a Backbone model.

To do so, we can look into object’s prototype and search for e.g. `fetch` and `sync` methods, which are pretty specific to Backbone models:

```javascript
QUnit.module( 'models/control-color.js', function() {
  QUnit.test( 'Color control exists and is Backbone model', function( assert ) {
     var Model = window.ControlColor;

     assert.ok( ! _.isUndefined( Model ), 'model is defined' );
     assert.ok( _.isFunction( Model.prototype.fetch ) && _.isFunction( Model.prototype.sync ), 'model is Backbone model' );
  } );
} );
```

If we run unit tests now (refresh the browser), we will get one failing test:

```
Tests completed in 10 milliseconds.
1 assertions of 2 passed, 1 failed.
```

To fix it, we have to make `ControlColor` a real Backbone model:

```javascript
window.ControlColor = Backbone.Model.extend( {} );
```

Now both tests are passing, so we have successfully gone through the **green** phase.
There is nothing to refactor at this point, so we’re skipping this step.

Our new Backbone model has to store an array of available options and an array of currently selected options.
So let’s write some tests to describe those requirements: 

```javascript
QUnit.module( 'models/control-color.js', function() {
  ...
  QUnit.test( 'Model has required properties', function( assert ) {
    var model = new window.ControlColor();

    assert.ok( model.has( 'options' ), 'model has "options" property' );
    assert.ok( _.isArray( model.get( 'options' ) ), '"options" is array' );

    assert.ok( model.has( 'checked' ), 'model has "checked" options property' );
    assert.ok( _.isArray( model.get( 'checked' ) ), '"checked" options is array' );
  } );
} );
```

All 4 tests are failing, so we’re good to proceed to **green** phase.
Note that in this set of tests, we’ve already initialized the `ControlColor` model so that we can use Backbone methods like `has()` or `get()`.

To make tests pass, let’s define defaults property in the `ControlColor` model:

```javascript
window.ControlColor = Backbone.Model.extend( {
  defaults: {
     options: [],
     checked: []
  }
} );
```
Tests are **green** now. Again we won’t refactor neither implementation nor testing code.

Providing Default Options
---

One of the `ControlColor`’s requirements was to have the ‘all’ option added to the list of available options.
So let’s add a test describing it straight away, in the same test block:

```javascript
QUnit.module( 'models/control-color.js', function() {
  ...
  QUnit.test( 'Model has required properties', function( assert ) {
    ...
    assert.ok( _.contains( model.get( 'options' ), 'all' ), 'options property contains "all" option' );
  } );
} );
```

There is no ‘all’ option in the model, so we’re getting one failing test now.
Let’s fix it in the simplest way possible:

```javascript
window.ControlColor = Backbone.Model.extend( {
  defaults: {
     options: [ 'all' ],
     checked: []
  }
} );
```

The new assertion passes now, the code is still very simple, so we carry on to next tests.

Our `ControlColor` model is going to receive available options from the back-end, so let’s play around with providing options on initialization:

```javascript
QUnit.module( 'models/control-color.js', function() {
  ...
  QUnit.test( 'Model is instantiated with correct options', function( assert ) {
    var model, options;

    model = new window.ControlColor( {
       options: [ 'red', 'green', 'blue' ]
    } );
    options = model.get( 'options' );

    assert.ok( _.contains( options, 'red' ), '"options" contains "red"' );
    assert.ok( _.contains( options, 'green' ), '"options" contains "green"' );
    assert.ok( _.contains( options, 'blue' ), '"options" contains "blue"' );
    assert.ok( _.contains( options, 'all' ), '"options" contains "all"' );
  } );
} );
```

As it turns out, the test we’ve just written doesn’t pass.
There is no ‘all’ item in the `options` array.
It gets overwritten by the new `options` array on initialization.

In this case we have to change the way ‘all’ option is added to the `options` array.
Let’s do it inside `initialize()` method:

```javascript
window.ControlColor = Backbone.Model.extend( {
  defaults: {
     options: [],
     checked: []
  },
  initialize: function( attrs ) {
     attrs = _.defaults( attrs || {}, this.defaults );
     attrs.options.push( 'all' );
  }
} );
```

The default ‘all’ item in the `options` array is going to be overwritten by the `attrs.options` list passed to the model on initialization, so there’s no point in keeping it in the `defaults` object anymore.

We have to manually extend `attrs` object on initialization (using very convenient `_.defaults()` method) and then append ‘all’ item to the end of the list.

To cover our first test (when no attributes were passed on initialization) we say we want to have an empty object if `attrs` is undefined: `attrs || {}`.

Now as we have our **green** phase completed, we can go ahead and **refactor** the code.
However, since our implementation is quite clean, we could work on the test code instead.

What I don’t like about it is the way `options` array is tested for value existence with `_.contains()` method.
We need 4 lines which are really quite similar. It doesn’t seem very DRY.

We could turn those 4 lines into an `_.each()` loop.
Really simple solution that would just work, but still it seems to me a bit suboptimal.

What if we used Qunit’s `deepEqual()` method? Let’s give it a try:

```javascript
QUnit.module( 'models/control-color.js', function() {
  ...
  QUnit.test( 'Model is instantiated with correct options', function( assert ) {
    var model, options;

    model = new window.ControlColor( {
       options: [ 'red', 'green', 'blue' ]
    } );
    options = model.get( 'options' );

    assert.deepEqual( options, [ 'all', 'red', 'green', 'blue' ], '"options" contains correct items' );
  } );
} );
```

Whoops! We’ve got **red** again.
This is because` deepEqual()` compares not only existence of items in the list, but also the order of the items.
We have to find another solution.

Luckily, brilliant [Underscore.js methods](http://underscorejs.org/#difference) come to the rescue.
We could use `_.difference()` method to compare actual and expected arrays.
If they contain the same items, an empty array will be returned.
Otherwise, we will get all items that are present in one array and not in the other one.
And what’s most important in our case: `_.difference()` doesn’t care about the order of items in the list.
One caveat, though: if one of the tested arrays is empty, `_.difference()` will return an empty array too, so we have to cover this edge case separately.

```javascript
QUnit.test( 'Model is instantiated with correct options', function( assert ) {
  var model, options;

  model = new window.ControlColor( {
     options: [ 'red', 'green', 'blue' ]
  } );
  options = model.get( 'options' );

  assert.notOk( _.isEmpty( options ), '"options" is not empty' );
  assert.deepEqual( _.difference( options, [ 'all', 'red', 'green', 'blue' ] ), [], '"options" array match the expectations' );
} );
```

It does look pretty neat, doesn’t it?

Now, as we went through **refactor** phase, we can carry on and test behaviour of the `checked` array.

Implementing Business Rules Around Checked Options
---

We know that by default, if nothing is passed on initialization to the model, ‘all’ option should be checked:

```javascript
QUnit.module( 'models/control-color.js', function() {
  ...
  QUnit.test( 'Checked array is handled properly', function( assert ) {
     var model;

     model = new window.ControlColor();
     assert.deepEqual( model.get( 'checked' ), [ 'all' ], '"all" option is checked by default' );
  } );
} );
```

Currently, the `checked` array is empty, so we’re getting a failing test, which is good!

Let’s implement a default `checked` value like:

```javascript
window.ControlColor = Backbone.Model.extend( {
  defaults: {
     options: [],
     checked: [ 'all' ]
  },
  initialize: function( attrs ) {
     attrs = _.defaults( attrs || {}, this.defaults );
     attrs.options.push( 'all' );
  }
} );
```

Test is now successful.

Let’s go ahead and check if providing another value to the initialization method gives results as expected:

```javascript
QUnit.test( 'Checked array is handled properly', function( assert ) {
  var model;

  model = new window.ControlColor();
  assert.deepEqual( model.get( 'checked' ), [ 'all' ], '"all" option is checked by default' );
  model = new window.ControlColor( {
    checked: [ 'red', 'green' ]
  } );
  assert.notOk( _.isEmpty( model.get( 'checked' ) ), '"checked" is not empty' );
  assert.deepEqual( _.difference( model.get( 'checked' ), [ 'red', 'green' ] ), [], 'default options are checked as expected' );
} );
```

Everything works as expected, the new test is **green**, so we can now proceed to testing the logic behind the ‘all’ option.

Please note that we’ll be handling all business logic in the model itself.
The view (that is going to be created in the last part of this series) will pass raw checkbox values to the model.
For instance, if the ‘red’ option was already checked and the user clicks on the ‘all’ checkbox, the model will receive an array containing both ‘red’ and ‘all’.
The role of the model is to remove ‘red’ from the `checked` array, leaving only the ‘all’ option.
The view, on the other hand, is going to listen to changes of the `checked` array in the model and update DOM accordingly.

In our test, the model instance’s `checked` array already contains two values: ‘red’ and ‘green’.
We will simulate checking the ‘all’ option, so an array consisting of 3 elements will be passed to the model:

```javascript
QUnit.test( 'Checked array is handled properly', function( assert ) {
  ...
  model.set( 'checked', [ 'all', 'red', 'green' ] );
  assert.deepEqual( model.get( 'checked' ), [ 'all' ], '"all" option unchecks other ones' );
} );
```

As expected, the test is failing. We can implement the missing functionality in such way:

```javascript
window.ControlColor = Backbone.Model.extend( {
  ...
  initialize: function( attrs ) {
     ...
     this.on( 'change:checked', this.updateChecked );
  },
  updateChecked: function( model, checked ) {
     if ( _.contains( checked, 'all' ) ) {
        this.set( 'checked', [ 'all' ], { silent: true } );
     }
  }
} );
```

The model is now listening to changes of its own `checked` attribute.
If the array contains ‘all’ option, we’re resetting `checked` so that it contains only ‘all’ value.
What’s more, we’re passing `{ silent: true }` option to the `set()` method so that `updateChecked()` won’t be fired again.

Now, as the test succeeds, we want to make sure the ‘all’ option will be unchecked when we pass some other value along the way from the view:

```javascript
QUnit.test( 'Checked array is handled properly', function( assert ) {
  ...
  model.set( 'checked', [ 'all', 'red', 'green' ] );
  assert.deepEqual( model.get( 'checked' ), [ 'all' ], '"all" option unchecks other ones' );
  model.set( 'checked', [ 'all', 'blue' ] );
  assert.deepEqual( model.get( 'checked' ), [ 'blue' ], '"all" option is removed if it is passed once again' );
} );
```

Instead of ‘blue’ option, we’re again getting ‘all’ option.
We have to make the test **green** again by checking if in previous set of attributes, the `checked` array already contained ‘all’ option.
If it’s true, we have to remove it from the array, leaving other options intact.

Here’s changed implementation of the `updateChecked()` method:

```javascript
updateChecked: function( model, checked ) {
  if ( _.contains( checked, 'all' ) ) {
     if ( _.contains( this.previous( 'checked' ), 'all' ) ) {
        this.set( 'checked', _.without( checked, 'all' ), { silent: true } );
     } else {
        this.set( 'checked', [ 'all' ], { silent: true } );
     }

  }
}
```

Tests are **green** again, so it’s time to **refactor**.
What I don’t like about the new code is how model’s `set()` method is called in two different places.
We could move the `set()` method outside of the `if … else` statement and operate on an internal variable instead, e.g.:

```javascript
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
```

Now the method looks slightly better, while tests are still passing.

Thanks to TDD we could easily and safely refactor our implementation. Our unit tests would let us know straight away if we introduced any bug by mistake at this stage.

In this post we have implemented a simple Backbone.js model that represents a hypothetical color control component. We used test-driven development principles to add all the functionality needed.

In the last part of the series, we will implement a Backbone.js view that will go along with our model. It will be responsible for rendering the markup, handling the user input and reflecting model’s changes in the UI.

---

In the last part of the series we will create a Backbone.js view. **[Continue reading...](./tutorial-part3.md)**