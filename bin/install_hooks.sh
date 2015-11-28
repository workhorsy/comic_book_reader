#!/bin/sh

cd .git/hooks/
rm -f pre-commit
ln -s ../../bin/pre-commit pre-commit
