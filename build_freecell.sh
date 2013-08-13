#!/bin/bash
wd="`pwd`"
cd ..
python bin/lime.py update freecell
python bin/lime.py build freecell -o freecell/compiled/freecell-c.js
cp freecell/compiled/freecell-c.js freecell/gapi/fc.js
cp freecell/assets/* freecell/compiled/assets/
cp freecell/assets/* freecell/gapi/assets/
cd "$wd"
