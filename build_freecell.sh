#!/bin/bash
wd="`pwd`"
cd ..
python bin/lime.py build freecell -o freecell/compiled/fc.js
cp freecell/assets/* freecell/compiled/assets/
cd "$wd"
