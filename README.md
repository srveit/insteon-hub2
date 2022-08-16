# insteon-plm

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![MIT License][license-image]][license-url]
[![Node.js Version][node-version-image]][node-version-url]
[![GitHub Build Status][github-build-badge]][github-build-url]
[![Codecov Status][codecov-image]][codecov-url]
[![Code Climate][code-climate-image]][code-climate-url]
[![Gitter][gitter-image]][gitter-url]
[![Known Vulnerabilities][snyk-badge]][snyk-url]
<!-- [![js-canonical-style][canonical-image]][canonical-url] -->

Library for monitoring and controlling Insteon devices through an Insteon hub.

## Architucture

The Insteon Hub 2 has a HTTP port that allows for controlling and monitoring
the hub and the devices controlled by it. To send a command to the hub, you
send a HTTP request. To read responses from the hub is a little trickier.
You send a HTTP request to get the buffer which returns a string of
hexadecimal characters. This string implements a
[ring (or circular) buffer][circular-buffer-url]. In order to not miss and
messages, this buffer must be read at a rate of 20 times per second.

## Files

- allLinkDatabase.js
  - createAllLinkDatabase
- allLinkRecord.js
  - createAllLinkRecord
- commandAnnotator.js
  - createCommandAnnotator
- constants.js
  - ALL\_LINK\_CODES
  - ALL\_LINK\_CONTROL\_CODES
  - ALL\_LINK\_CONTROL\_NAMES
  - ALL\_LINK\_TYPES
  - BUTTON\_EVENTS
  - INSTEON\_MESSAGE\_TYPES
  - NAK\_ERROR\_CODES
  - OPERATING\_FLAGS
  - OUTLET\_CODES
  - OUTLET\_NAMES
  - ENGINE\_VERSION\_CODES
  - ENGINE\_VERSION\_NAMES
  - X10\_COMMANDS
  - X10\_HOUSE\_CODES
  - X10\_UNIT\_CODES
- device.js
  - createDevice
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
- deviceManager.js
  - createDeviceManager
- encodeCommand.js
  - encodeCommand
  - commandResponseMatcher
- house.js
  - createHouse
- parseInsteonCommand.js
  - parseInsteonCommand
- parsePlmBuffer.js
  - parsePlmBuffer
- parsers.js
  - parsers
- plm.js (TODO: rewrite to use stream)
  - createPlm
- plmBase.js
  - createPlmBase
- plmBufferProcessor.js
  - createPlmBufferProcessor
- plmCommandQueue.js
  - createPlmCommandQueue
- plmCommandStream.js
  - createPlmCommandStream
- plmStream.js
  - createPlmStream

## References

- [openHAB 1 Add-ons resources](https://github.com/openhab/openhab1-addons/tree/master/bundles/binding/org.openhab.binding.insteonplm/src/main/resources)
- [leftover code](https://web.archive.org/web/20191230021838/http://www.leftovercode.info/)
- [Leftover Code SmartLinc](http://www.leftovercode.info/smartlinc.php)
- [The Insteon Hub and SmartLinc 2414N HTTP API for X10 Devices](http://www.leftovercode.info/smartlinc_x10.html)
- [Quick Reference Guide for Smarthome Device Manager for INSTEON](https://web.archive.org/web/20130519075719/http://www.insteon.com/sdk/files/dm/docs/)
- [Insteon Custom Commands for HouseLinc](https://web.archive.org/web/20141125100324/http://www.insteon.com/houselinc-insteon-custom-commands.html)
- [Insteon Hacking Guides](http://efundies.com/guides/)
- [Insteon Device Controller for Windows](https://web.archive.org/web/20151008042115/http://fredricksensoftware.us/Insteon/Device%20Controller/index.htm)
- [INSTEON COMMAND LIST](http://www.madreporite.com/insteon/commands.htm)
- [Under the Insteon Hub Hood](https://web.archive.org/web/20150503192537/http://blog.automategreen.com/post/under-the-insteon-hub-hood)
- [Intellihome 2.5 - Now supports ISY and iPhone 5!](https://forum.smarthome.com/topic.asp?TOPIC_ID=11063&whichpage=2)
- [Insteon Direct Commands](http://www.richstevenson.com/2014/01/06/insteon-direct-commands/)
- [Insteon Hub Commands](https://openremote.github.io/archive-dotorg/forums/attachments/22882151/23036480.pdf)

[bithound-image]: https://www.bithound.io/github/srveit/insteon-plm/badges/score.svg
[bithound-url]: https://www.bithound.io/github/srveit/insteon-plm
[canonical-image]: https://img.shields.io/badge/code%20style-canonical-brightgreen.svg?style=flat
[canonical-url]: https://github.com/gajus/eslint-config-canonical
[circular-buffer-url]: https://en.wikipedia.org/wiki/Circular_buffer
[code-climate-image]: https://img.shields.io/codeclimate/maintainability/srveit/insteon-plm.svg
[code-climate-url]: https://codeclimate.com/github/srveit/insteon-plm
[codecov-image]: https://img.shields.io/codecov/c/github/babel/babylon/master.svg?style=flat
[codecov-url]: https://codecov.io/gh/babel/babylon
[coveralls-image]: https://coveralls.io/repos/github/srveit/insteon-plm/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/srveit/insteon-plm?branch=master
[downloads-image]: https://img.shields.io/npm/dm/insteon-plm.svg
[downloads-url]: https://npmjs.org/package/insteon-plm
[github-build-badge]: https://img.shields.io/github/workflow/status/srveit/insteaon-plm/build-actions
[github-build-url]: https://github.com/srveit/insteaon-plm/actions/workflows/test-actions.yml
[gitter-image]: https://img.shields.io/gitter/room/insteon-plm/Lobby.svg
[gitter-url]: https://gitter.im/insteon-plm/Lobby
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: http://choosealicense.com/licenses/mit/
[node-version-image]: https://img.shields.io/node/v/insteon-plm.svg
[node-version-url]: https://nodejs.org/en/download/
[npm-image]: https://img.shields.io/npm/v/insteon-plm.svg
[npm-url]: https://npmjs.org/package/insteon-plm
[snyk-badge]: https://snyk.io/test/github/srveit/insteon-plm/badge.svg
[snyk-url]: https://snyk.io/test/github/srveit/insteon-plm

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
