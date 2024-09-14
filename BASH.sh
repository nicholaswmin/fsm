deps="0";
devDeps="0";
MAX_DEPS="1";
MAX_DEVDEPS="1";

if [ $deps -le $MAX_DEPS ]; then depsOk="1"; else depsOk="0"; fi

if [ $devDeps -le $MAX_DEVDEPS ]; then devDepsOk="1"; else devDepsOk="0"; fi

if [[ $depsOK = "1" && $devDepsOk = "1" ]]; then allOk="1"; else allOk="0"; fi

echo "$depsOK"
