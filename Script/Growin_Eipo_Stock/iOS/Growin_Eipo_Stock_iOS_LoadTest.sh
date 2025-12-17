#!/bin/bash

# chmod +x Growin_Eipo_Stock_iOS_LoadTest.sh
# ./Growin_Eipo_Stock_iOS_LoadTest.sh
# Declare variables
ENV="INT"
USER=205
DURATION="2h"
NUMSTART=101
RUNBY="LoadTest"
RUNTYPE="LoadTest"
SLEEP=300

pwd
# cd /home/qa/mostng_performancetest_api/Script/Growin_Eipo_Stock/iOS || exit 1
pwd

#Load Test
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : Load Test All BP"

# Run k6 commands using the captured date and time
../../../k6 run Growin_Eipo_Stock_iOS_LoadTest.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/LoadTest/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_72.html

