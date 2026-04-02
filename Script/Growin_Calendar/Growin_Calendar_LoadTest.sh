#!/bin/bash

# chmod +x Growin_Calendar_LoadTest.sh
# ./Growin_Calendar_LoadTest.sh
# Declare variables
ENV="INT"
USER=400
DURATION="2h"
NUMSTART=1
RUNBY="LoadTest"
RUNTYPE="LoadTest"
SLEEP=1200

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_Calendar || exit 1
pwd

# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : Load Test All BP Android"

# Run k6 commands using the captured date and time
../../k6 run Growin_Calendar.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e PLATFORM=Android --out dashboard=export=../../Report/Growin_Calendar/Android/${RUNTYPE}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}.html
sleep "$SLEEP"

# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : Load Test All BP iOS"

# Run k6 commands using the captured date and time
../../k6 run Growin_Calendar.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Calendar/iOS/${RUNTYPE}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}.html
sleep "$SLEEP"

# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : Load Test All BP Web"

# Run k6 commands using the captured date and time
../../k6 run Growin_Calendar.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP001 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Calendar/Web/${RUNTYPE}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}.html
sleep "$SLEEP"