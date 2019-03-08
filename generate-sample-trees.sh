#!/bin/bash

js/cli.js | dot -Tsvg > doc/angular-all.svg
js/cli.js -p @angular | dot -Tsvg > doc/angular-only.svg
js/cli.js -p @angular -l | dot -Tsvg > doc/angular-and-direct-only.svg
