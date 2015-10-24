connect-four
============

[![Build Status](https://travis-ci.org/jamiely/connect-four-coffeescript.svg?branch=master)](https://travis-ci.org/jamiely/connect-four-coffeescript)


Intro
-----

This was mostly written to get some coffeescript practice.

Usage
-----

To run the the app, compile the coffee files using the included cake 
file. 

```bash
cd tests/jasmine
cake watch:all
```

Run the main app at the following URL after compiling the coffee script
files:

    /index.html

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

The drop sound is from: http://www.freesound.org/people/FreqMan/sounds/43603/
Cheer sound: http://www.freesound.org/people/Tomlija/sounds/99634/


