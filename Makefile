
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

clobber: clean
	rm -fr node_modules

.PHONY: clean
