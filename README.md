# o2cm-calculator
Quick and dirty O2CM calculator website for individuals

This was created as a replacement to http://ballroom.union.rpi.edu/calculator which I created back in 2015 when I didn't know better.

# Technical Notes

## Dependencies

- php
- node/npm

## Building

```sh
$ make build
```

## Running locally

### Run server

```sh
$ make run
```

And then open https://localhost:8080

## Deployment

```sh
$ make publish
```

and then copy the contents of `.publish` to your webserver (likely in a `public_html` folder).