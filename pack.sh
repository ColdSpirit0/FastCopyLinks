#!/bin/bash

# please set path to Firefox executable
BROWSER_PATH=""

EXTENSION_NAME="fast_copy_links.xpi"
SCRIPT_DIR=$(dirname "$(realpath "$0")")

# remove previous extension
rm -f ${EXTENSION_NAME}

# pack
cd "${SCRIPT_DIR}/extension" || exit 1
zip -r "../${EXTENSION_NAME}" ./*
cd ..

# if browser path exists
if [ -n "${BROWSER_PATH}" ]
then
	# install plugin
	if   [[ "${OSTYPE}" = linux* ]]; then
		start "${BROWSER_PATH}" "${EXTENSION_NAME}"
	elif [[ "${OSTYPE}" = darwin20* ]]; then
		# this may only work if browser is currently not open
		open "${BROWSER_PATH}" --args "${SCRIPT_DIR}/${EXTENSION_NAME}"
	else
		echo "Please install ${EXTENSION_NAME} manually."
	fi
fi
