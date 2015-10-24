connect-four
============

[![Build Status](https://travis-ci.org/jamiely/connect-four-coffeescript.svg?branch=master)](https://travis-ci.org/jamiely/connect-four-coffeescript)


Intro
-----

This was mostly written to get some CoffeeScript practice.

Usage
-----

To run the the app, compile the coffee files using `gulp build`.
This will concatenate the CoffeeScript source files, convert the
file into JavaScript, and put `app.js` in the `js/build` file.
An alternative is to run `npm run build`.

Run the main app by opening `index.html` in a browser.

Tests
-----

The standard command is

```bash
npm test
```

which will run `gulp jasmine-phantom`, which spins up phantomjs to run
the included jasmine specs.

Media
-----

Simple UI Gameplay: http://youtu.be/UYrY0yDt-sY

3d UI Gameplay: http://youtu.be/Uj7cEo-iIVw

A screenshot of the Simple UI view:
![Simple UI](connect-four-coffeescript/raw/master/img/ui_simple.png)

A screenshot of the 3d UI view:
![3d UI](connect-four-coffeescript/raw/master/img/ui_3d_csg.png)

Assets
------

* The drop sound is from: http://www.freesound.org/people/FreqMan/sounds/43603/
* Cheer sound: http://www.freesound.org/people/Tomlija/sounds/99634/


