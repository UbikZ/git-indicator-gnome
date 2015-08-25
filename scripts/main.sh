#!/usr/bin/env bash

# Init
BASE=$(dirname $0)

# Include
source "$BASE/functions.sh"

# Parameters reading :
while [ ! -z $1 ]; do
    case "$1" in
        --init)
            initConfiguration $2
            exit 1
            ;;
        *)
            exit -1
            ;;
    esac
    shift
done
