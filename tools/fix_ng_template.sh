#!/bin/bash

HEADER_FILE=$1
TARGET=$2

usage() {
	echo "usage: $0 header.txt target-dir"
	exit
}

if [ "$HEADER_FILE" = "" ]; then
	usage
fi

if [ "$TARGET" = "" ]; then
	usage
fi

TEMP=`mktemp`

for file in $TARGET/*.ts $TARGET/*.scss; do
	sed -i 's/^\( \)*/\0\0/g' $file
	sed -i 's/\(class.*\) {/\1\n{/' $file

	(cat $HEADER_FILE; cat $file) > $TEMP
	cp $TEMP $file
done

