#!/bin/bash

# chmod +x ExaCC_LoadTest.sh
# ./ExaCC_LoadTest.sh
# Declare variables
ENV="INT"
USER=420
DURATION="15m"
NUMSTART=1
RUNBY="LoadTest"
RUNTYPE="LoadTest"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/ExaCC || exit 1
pwd

#Web
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : Load Test All BP Web"

# Run k6 commands using the captured date and time
../../k6 run ExaCC.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/${RUNTYPE}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_48.html
sleep "$SLEEP"