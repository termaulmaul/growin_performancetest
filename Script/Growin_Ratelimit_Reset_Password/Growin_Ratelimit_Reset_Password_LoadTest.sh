#!/bin/bash

# chmod +x Growin_Ratelimit_Reset_Password_LoadTest.sh
# ./Growin_Ratelimit_Reset_Password_LoadTest.sh
# Declare variables
ENV="INT"
USER=300
DURATION="3m"
NUMSTART=1
RUNBY="LoadTest"
RUNTYPE="LoadTest"
SLEEP=300

pwd
# cd /home/qa/mostng_performancetest_api/Script/Growin_Ratelimit_Reset_Password || exit 1
pwd

#BP001
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : Load Test All BP Web"

# Run k6 commands using the captured date and time
# ../../k6 run Growin_Ratelimit_Reset_Password.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Ratelimit_Reset_Password/Web/${RUNTYPE}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_48.html
k6 run Growin_Ratelimit_Reset_Password.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e PLATFORM=Web
sleep "$SLEEP"