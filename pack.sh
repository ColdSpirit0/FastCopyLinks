#!/bin/bash

BROWSER_PATH=""
EXTENSION_NAME="fast_copy_links.xpi"

# remove previous extension
rm -f $EXTENSION_NAME

# pack
cd extension
zip -r "../$EXTENSION_NAME" *
cd ..

# if browser path exists
if [ -n "$BROWSER_PATH" ]
then
	# install plugin
	start "$BROWSER_PATH" "$EXTENSION_NAME"
fi
