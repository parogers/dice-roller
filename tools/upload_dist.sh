#!/bin/bash

PROJECT="dice"
LOGIN="peter@writtenwordinteractive.com"

./node_modules/.bin/ng build --prod || exit

sed -i 's/base href="\/"/base href="\/dice\/"/' ./dist/dice-roller/index.html

ssh $LOGIN "rm /tmp/$PROJECT.writtenwordinteractive.com-old/ -R"
ssh $LOGIN "mkdir -p /tmp/$PROJECT.writtenwordinteractive.com-new"
scp -r dist/dice-roller/* $LOGIN:/tmp/$PROJECT.writtenwordinteractive.com-new/
ssh $LOGIN "mv writtenwordinteractive.com/$PROJECT /tmp/$PROJECT.writtenwordinteractive.com-old && mv /tmp/$PROJECT.writtenwordinteractive.com-new writtenwordinteractive.com/$PROJECT"
