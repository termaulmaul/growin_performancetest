#!/bin/bash

# chmod +x Growin_Daily_Trade_Regression.sh
# ./Growin_Daily_Trade_Regression.sh
# Declare variables
ENV="INT"
USER=335
DURATION="15m"
NUMSTART=1
RUNBY="Regression"
RUNTYPE="DryRun"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_Daily_Trade || exit 1
pwd

#BP001
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP001 Web"

# Run k6 commands using the captured date and time
../../k6 run Growin_Daily_Trade.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP001 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Daily_Trade/Web/BP001/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_48.html
sleep "$SLEEP"