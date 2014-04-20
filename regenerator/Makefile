SRC = $(shell find lib -name "*.js")
BUILD = $(subst lib,build,$(SRC))

build: $(BUILD)

build/%.js: lib/%.js
	@mkdir -p build
	@node_modules/.bin/regenerator --include-runtime $< > $@

clean:
	@rm -rf build

.PHONY: clean
