#!/bin/bash

element1="30"

declare -a arr=("element1" "element2" "element3")

## now loop through the above array
for i in "${arr[@]}"
do
   if [ -z "${!i}" ]; then
        echo "${i} is unset";
    fi
done
