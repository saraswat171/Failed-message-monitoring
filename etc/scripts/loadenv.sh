#!/bin/bash

if test -f $1; then
    set -o allexport
    # shellcheck disable=SC2039
    source $1
    set +o allexport
fi
