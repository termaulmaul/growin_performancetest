#!/bin/bash

# chmod +x Growin_UUPDP_Regression.sh
# ./Growin_UUPDP_Regression.sh
# Declare variables
ENV="INT"
USER=40
DURATION="15m"
NUMSTART=1
RUNBY="Regression"
RUNTYPE="DryRun"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_UUPDP || exit 1
pwd

#BP001
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP001 Android"

# Run k6 commands using the captured date and time
../../k6 run Growin_UUPDP.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP001 -e PLATFORM=Android --out dashboard=export=../../Report/Growin_UUPDP/Android/BP001/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_48.html
sleep "$SLEEP"