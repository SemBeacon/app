# Demo resources

These files are bundled with the app for demo mode.

`solid-profile.ttl` is a synthetic profile (no real personal data). `iot.ttl` is the local
SemBeacon 1.1 interaction example used by the demo: a temperature observation and a lamp
actuation. It is served by `src/demo/DemoResources.ts` without network access.

The OpenHPS 2021 building example is **not** vendored. The demo still points at the public
website resource; when it cannot be loaded, the scanner shows the offline error and offers a
retry.
