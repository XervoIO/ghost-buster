Ghost Buster
=================

[![NPM](https://nodei.co/npm/ghost-buster.png)](https://nodei.co/npm/ghost-buster/)

The goal for Ghost Buster is to be a CLI tool to convert a Ghost app into an app that can easily be run on any [Node.js PAAS providers](https://github.com/joyent/node/wiki/Node-Hosting). Right now, it only works with [Modulus](http://modulus.io). 

## Installing
    $ npm install -g ghost-buster

## Usage
    $ cd /path/to/ghost
    $ ghost-buster [options]

    --version             print ghost-buster version and exit


## Examples
Convert the Ghost app in the current directory 

    $ ghost-buster


## Support
Ghost Buster has been tested with the a hand full of Ghost apps. If you find an app that doesn't
convert correctly, throw an issue in Github -
[https://github.com/onmodulus/ghost-buster/issues](https://github.com/onmodulus/ghost-buster/issues)

## Credits
Ghost Buster was modeled after [Demeteorizer](https://github.com/onmodulus/demeteorizer). 

