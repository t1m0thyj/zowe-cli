#!/bin/bash
set -e

echo "================ TODO: Remove this ==============="
where zowe
echo PATH = $PATH
echo "================ daemon enable ==============="
zowe daemon enable
echo "====== After zowe command TODO: Remove this ======="
exit $?
