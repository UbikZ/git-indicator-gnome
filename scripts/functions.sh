#!/usr/bin/env bash

# Init
BASE=$(dirname $0)

# Business Functions
function checkGitInstall {
  [[ ! $(hash git | wc -l) -eq 0 ]] &&  exit -1
}

function initConfiguration {
    CONFIG=()
    if [ ! -f "$BASE/$1" ]; then
        CONFIG=$(find ~/ -type d -name '*.git' | sed "s/\.git//g" | egrep -v '(bundle|tests|vendor|.composer)')
    else
        for line in $(cat $BASE/$1); do
            CONFIG+=("$line")
        done
    fi
    echo "${CONFIG[@]}"
}

function fetch {
    REPOSITORY=$1
    result=1

    checkRepository "$REPOSITORY"
    (cd "$REPOSITORY" && (git fetch -q || result=-1) && cd "$BASE")

    echo $result
}

function gitDiffCountCommits {
    REPOSITORY="$1"
    SRC_BRANCH="master"
    DEST_BRANCH="master"

    checkRepository "$REPOSITORY"
    [ "$2" != "" ] && SRC_BRANCH="$2"
    [ "$3" != "" ] && DEST_BRANCH="$3"

    cd "$REPOSITORY" && (git rev-list $SRC_BRANCH..origin/$DEST_BRANCH --count 2>/dev/null || echo -1) && cd "$BASE"
}

function gitCountCommits {
    REPOSITORY="$1"
    DEST_BRANCH="master"

    checkRepository "$REPOSITORY"
    [ "$2" != "" ] && DEST_BRANCH="$2"
    cd "$REPOSITORY" && (git rev-list origin/$DEST_BRANCH --count 2>/dev/null || echo -1) && cd "$BASE"
}

function checkRepository {
    [ ! -d "$1/.git" ] && echo "$1 is not a git repository" && exit 0
}
