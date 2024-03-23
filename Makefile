.PHONY: help
help:
	@LC_ALL=C $(MAKE) -pRrq -f $(firstword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/(^|\n)# Files(\n|$$)/,/(^|\n)# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'


.PHONY: build
build:
	cd client; npm run build; cd ..


.PHONY: run
run: build
	php -S localhost:8080 server/router.php


.PHONY: publish
publish: build
	rm -rf .publish
	mkdir .publish
	mkdir .publish/client
	cp server/router.php .publish/index.php
	cp -r server/ .publish/server
	cp -r client/build .publish/client