#!/bin/bash

# chmod +x Growin_Password_Expired_LoadTest.sh
# ./Growin_Password_Expired_LoadTest.sh
# Declare variables
ENV="INT"
USER=400
DURATION="2h"
NUMSTART=1
RUNBY="LoadTest"
RUNTYPE="LoadTest"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_Password_Expired || exit 1
pwd

#BP001
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : Load Test All BP Android"

# Run k6 commands using the captured date and time
../../k6 run Growin_Password_Expired_Web_LoadTest.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e PLATFORM=Android --out dashboard=export=../../Report/Growin_Password_Expired/Android/${RUNTYPE}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_48.html
sleep "$SLEEP"

# # Verify the captured date and time
# echo "Captured Date    : $dateStr"
# echo "Captured Time    : $timeStr"
# echo "Current Scenario : Load Test All BP iOS"

# # Run k6 commands using the captured date and time
# ../../k6 run Growin_Password_Expired_Web_LoadTest.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e PLATFORM=iOS  -e NUMSTART="$NUMSTART" --out dashboard=export=../../Report/Growin_Password_Expired/iOS/${RUNTYPE}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_48.html
# sleep "$SLEEP"