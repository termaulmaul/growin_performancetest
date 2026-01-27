#!/bin/bash

# chmod +x Growin_2FA_LoadTest.sh
# ./Growin_2FA_Regression.sh
# Declare variables
ENV="INT"
USER=400
DURATION="2h"
NUMSTART=1
RUNBY="LoadTest"
RUNTYPE="LoadTest"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_2FA/Web || exit 1
pwd

#BP001
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : Load Test All BP"

# Run k6 commands using the captured date and time
../../../k6 run Growin_2FA_LoadTest.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP004 --out dashboard=export=../../../Report/Growin_2FA/LoadTest/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_72.html