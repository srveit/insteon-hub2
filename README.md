# insteon-plm
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![MIT License][license-image]][license-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][travis-image]][travis-url]
[![AppVeyor Build Status][appveyor-image]][appveyor-url]
[![Codecov Status][codecov-image]][codecov-url]
[![Code Climate][code-climate-image]][code-climate-url]
[![Gitter][gitter-image]][gitter-url]
[![Dependency Status][dependency-image]][dependency-url]
[![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]
<!-- [![js-canonical-style][canonical-image]][canonical-url] -->

Library for monitoring and controlling Insteon devices through an Insteon hub.

## Files

- allLinkDatabase.js  (36%)
  - createAllLinkDatabase
- allLinkRecord.js (81%)
  - createAllLinkRecord
- constants.js
  - ALL_LINK_CODES
  - ALL_LINK_CONTROL_CODES
  - ALL_LINK_CONTROL_NAMES
  - ALL_LINK_TYPES
  - BUTTON_EVENTS
  - INSTEON_MESSAGE_TYPES
  - NAK_ERROR_CODES
  - OPERATING_FLAGS
  - OUTLET_CODES
  - OUTLET_NAMES
  - X10_COMMANDS
  - X10_HOUSE_CODES
  - X10_UNIT_CODES
- deviceCategories.js
  - '00'
  - '01'
  - '02'
  - '03'
  - '04'
  - '05'
  - '06'
  - '07'
  - '08'
  - '09'
  - '0A'
  - '0B'
  - '0C'
  - '0D'
  - '0E'
  - '0F'
  - '10'
  - '11'
  - '12'
  - '13'
  - '14'
  - '15'
  - '16'
  - '17'
  - FE
  - FF
- encodeCommand.js (67%)
- parseInsteonCommand.js (70%)
- parsers.js (49%)
- plm.js (TODO: rewrite to use stream)
  - createPlm
- plmBase.js
  - createPlmBase
- plmBufferProcessor.js
  - createPlmBufferProcessor
- plmCommandStream.js
  - createPlmCommandStream
- plmStream.js
  - createPlmStream

## References

https://github.com/openhab/openhab1-addons/tree/master/bundles/binding/org.openhab.binding.insteonplm/src/main/resources


http://www.leftovercode.info/
http://www.leftovercode.info/smartlinc.php
http://www.leftovercode.info/smartlinc_x10.html
http://www.insteon.com/sdk/files/dm/docs/
http://www.insteon.com/houselinc-insteon-custom-commands.html
http://efundies.com/guides/
http://fredricksensoftware.us/Insteon/Device%20Controller/index.htm
http://www.madreporite.com/insteon/commands.htm
http://blog.automategreen.com/post/under-the-insteon-hub-hood
http://www.smarthome.com/forum/topic.asp?TOPIC_ID=11063&whichpage=2
http://www.richstevenson.com/2014/01/06/insteon-direct-commands/
https://openremote.github.io/archive-dotorg/forums/attachments/22882151/23036480.pdf
https://blog.automategreen.com/post/under-the-insteon-hub-hood/

[npm-image]: https://img.shields.io/npm/v/insteon-plm.svg
[npm-url]: https://npmjs.org/package/insteon-plm
[downloads-image]: https://img.shields.io/npm/dm/insteon-plm.svg
[downloads-url]: https://npmjs.org/package/insteon-plm
[node-version-image]: https://img.shields.io/node/v/insteon-plm.svg
[node-version-url]: https://nodejs.org/en/download/
[travis-image]: https://img.shields.io/travis/srveit/insteon-plm/master.svg
[travis-url]: https://travis-ci.org/srveit/insteon-plm
[appveyor-image]: https://img.shields.io/appveyor/ci/srveit/insteon-plm/master.svg
[appveyor-url]: https://ci.appveyor.com/project/srveit/insteon-plm/branch/master
[coveralls-image]: https://coveralls.io/repos/github/srveit/insteon-plm/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/srveit/insteon-plm?branch=master
[code-climate-image]: https://img.shields.io/codeclimate/maintainability/srveit/insteon-plm.svg
[code-climate-url]: https://codeclimate.com/github/srveit/insteon-plm
[gitter-image]: https://img.shields.io/gitter/room/insteon-plm/Lobby.svg
[gitter-url]: https://gitter.im/insteon-plm/Lobby
[bithound-image]: https://www.bithound.io/github/srveit/insteon-plm/badges/score.svg
[bithound-url]: https://www.bithound.io/github/srveit/insteon-plm
[dependency-image]: https://img.shields.io/david/srveit/insteon-plm.svg
[dependency-url]: https://david-dm.org/srveit/insteon-plm
[codecov-image]: https://img.shields.io/codecov/c/github/babel/babylon/master.svg?style=flat
[codecov-url]: https://codecov.io/gh/babel/babylon
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: http://choosealicense.com/licenses/mit/
[canonical-image]: https://img.shields.io/badge/code%20style-canonical-brightgreen.svg?style=flat
[canonical-url]: https://github.com/gajus/eslint-config-canonical
[greenkeeper-image]: https://badges.greenkeeper.io/srveit/insteon-plm.svg
[greenkeeper-url]: https://greenkeeper.io/

<!--

https://sonarcloud.io/dashboard/index/srveit:insteon-plm

[testling-image]: https://ci.testling.com/srveit/insteon-plm.png
[testling-url]: https://ci.testling.com/srveit/insteon-plm
[cdnjs-image]: https://img.shields.io/cdnjs/v/insteon-plm.svg
[cdnjs-url]: https://cdnjs.com/libraries/insteon-plm

[![locked](http://badges.github.io/stability-badges/dist/locked.svg)](http://github.com/badges/stability-badges)
[![Readme](https://img.shields.io/badge/readme-tested-brightgreen.svg?style=flat)](https://www.npmjs.com/package/reamde)
[![Doug's Gratipay][gratipay-image-dougwilson]][gratipay-url-dougwilson]
[![API documented](https://img.shields.io/badge/API-documented-brightgreen.svg)](https://raszi.github.io/node-tmp/)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/thlorenz/convert-source-map/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
[![Bountysource](https://www.bountysource.com/badge/tracker?tracker_id=282608)](https://www.bountysource.com/trackers/282608-eslint?utm_source=282608&utm_medium=shield&utm_campaign=TRACKER_BADGE)
[![Bower version](https://img.shields.io/bower/v/spdx-license-ids.svg)](https://github.com/shinnn/spdx-license-ids/releases)
[![Codeship Status for ashtuchkin/iconv-lite](https://www.codeship.com/projects/81670840-fa72-0131-4520-4a01a6c01acc/status)](https://www.codeship.com/projects/29053)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![ExternalEditor uses the MIT](https://img.shields.io/npm/l/external-editor.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Feslint%2Feslint.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Feslint%2Feslint?ref=badge_large)
[![Follow on Twitter](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/hiddentao)
[![Known Vulnerabilities](https://snyk.io/test/npm/promise-core/badge.svg?style=flat-square&maxAge=2592000)](https://snyk.io/test/npm/promise-core)
[![NPM Stats](https://nodei.co/npm/iconv-lite.png?downloads=true&downloadRank=true)](https://npmjs.org/packages/iconv-lite/)
[![NPM](https://nodei.co/npm-dl/deep-extend.png?height=3)](https://nodei.co/npm/deep-extend/)
[![OpenCollective](https://opencollective.com/debug/sponsors/badge.svg)](#sponsors)
[![Sauce Test Status](https://saucelabs.com/browser-matrix/epoberezkin.svg)](https://saucelabs.com/u/epoberezkin)
[![Slack Channel](http://zeit-slackin.now.sh/badge.svg)](https://zeit.chat/)
[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)
[![Windows Build](https://img.shields.io/appveyor/ci/alexindigo/asynckit/v0.4.0.svg?label=windows:0.12-6.x&style=flat)](https://ci.appveyor.com/project/alexindigo/asynckit)
[![Windows Tests](https://img.shields.io/appveyor/ci/bcoe/nyc-ilw23/master.svg?label=Windows%20Tests)](https://ci.appveyor.com/project/bcoe/nyc-ilw23)
[![](http://img.shields.io/badge/unicorn-approved-ff69b4.svg)](https://www.youtube.com/watch?v=9auOCbH5Ns4)


-->
