#!/bin/bash

# chmod +x Growin_News_LoadTest.sh
# ./Growin_News_LoadTest.sh
# Declare variables
ENV="INT"
USER=335
DURATION="2h"
NUMSTART=1
RUNBY="LoadTest"
RUNTYPE="LoadTest"
SLEEP=0

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_Daily_Trade || exit 1
pwd

# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : Load Test All BP Web"

# Run k6 commands using the captured date and time
../../k6 run Growin_Daily_Trade.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP001 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Daily_Trade/Web/${RUNTYPE}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}.html
sleep "$SLEEP"