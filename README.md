Ghost Buster
=================

[![NPM](https://nodei.co/npm/ghost-buster.png)](https://nodei.co/npm/ghost-buster/)

# ** Important **

Version 1.0.0 removed support for deploying to Modulus' cloud storage. The current
and only way to deploy is to create/edit your blog locally then deploy to Modulus.

If you are using Ghost 0.3.3 with cloud storage on Modulus, use ghost-buster version 0.0.7.
Also, please continue to use 0.3.3. 

Ghost Buster is a CLI tool for Ghost apps.

## Installing
    $ npm install -g ghost-buster

## Usage
    $ cd /path/to/ghost
    $ ghost-buster [options]

         --version                      print ghost-buster version and exit
    -db  --database [pathtodb]          Pushing Local blog at [path]instead of syncing with cloud storage)
    -u   --upgrade [ghostversion]       Upgrade Ghost (Doesn\'t automatically run ghost-buster))
    -d   --downgrade [ghostversion]     Downgrade Ghost (Doesn\'t automatically run ghost-buster))


## Examples

###To convert your ghost project to run on Modulus:

  $ ghost-buster -l content/data/ghost.db

This will deploy the blog specified by [path]. One MUST update their blog locally.
Updating live will not do anything because the blog will be overwritten by local 
copy on deployment. 

###Version management:

  $ ghost-buster -u version

This will upgrade your version of Ghost to the version specified 

  $ ghost-buster -d version

This will downgrade your version of Ghost to the version specified

## Support
Ghost Buster has been tested with the a hand full of Ghost apps. If you find an app that doesn't
convert correctly, throw an issue in Github -
[https://github.com/onmodulus/ghost-buster/issues](https://github.com/onmodulus/ghost-buster/issues)

## Credits
Ghost Buster was modeled after [Demeteorizer](https://github.com/onmodulus/demeteorizer). 

