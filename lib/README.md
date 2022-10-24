# Notes

These are notes on implementation details of the inteon-plm library.

## The use of port 443

We are unable to use port 443 (HTTPS) on the Insteon Hub because it uses an old
cipher that the newest versions of openssl do not accept.

## Reading the PLM

The Insteon Hub Central Controller (2245-222) has an HTTP interface
that can be used to monitor and control Insteon devices in the
home. This is described in the [INSTEON Hub: Developer's
Guide][2242-222dev-062013-en]

[2242-222dev-062013-en]: http://cache.insteon.com/developer/2242-222dev-062013-en.pdf
