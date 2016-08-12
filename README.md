Tutorial: Test-driven Development of a Backbone.js App
===

This project contains source files for TDD + Backbone.js simple component development.
The tutorial itself consists of 3 parts:

1. [TDD Fundamentals](./docs/tutorial-part1.md)
2. [Implementing Backbone.js Model](./docs/tutorial-part2.md)
3. [Creating Backbone.js View](./docs/tutorial-part3.md)

Gulp Recipe
---

In order to compile and watch for changes locally, after downloading the repo, install `npm`:

```
npm install
```

Then use:

```
gulp test
```

to run a single test, or:

```
gulp watch
```

to watch both source and test file and run QUnit on change event.

Credits
---

The tutorial was written by Piotr Delawski, [XWP](http://xwp.co).

License
---

The project is licensed under [MIT License](LICENSE).