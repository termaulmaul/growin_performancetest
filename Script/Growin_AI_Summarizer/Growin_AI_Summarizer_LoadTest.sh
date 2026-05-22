#!/bin/bash

# chmod +x Growin_AI_Summarizer_LoadTest.sh
# ./Growin_AI_Summarizer_LoadTest.sh
# Declare variables
ENV="INT"
USER=400
DURATION="2h"
NUMSTART=1
RUNBY="LoadTest"
RUNTYPE="LoadTest"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_AI_Summarizer || exit 1
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
../../k6 run Growin_AI_Summarizer.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e PLATFORM=Web --out dashboard=export=../../Report/Growin_AI_Summarizer/Web/${RUNTYPE}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_48.html
# ../../k6 run Growin_AI_Summarizer.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP001,BP004,BP006,BP008,BP010,BP012 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_AI_Summarizer/Web/${RUNTYPE}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_48.html
sleep "$SLEEP"