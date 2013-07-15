#!/bin/bash
wd="`pwd`"
cd ..
python bin/lime.py update freecell
python bin/lime.py build freecell -o freecell/compiled/freecell-c.js
cp freecell/assets/* freecell/compiled/assets/
cd "$wd"
