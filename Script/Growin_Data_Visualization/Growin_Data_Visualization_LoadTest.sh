#!/bin/bash

# chmod +x Growin_Data_Visualization_LoadTest.sh
# ./Growin_Data_Visualization_LoadTest.sh
# 00 01 * * 1-5 /home/qa/mostng_performancetest_api/Script/Growin_Data_Visualization/Growin_Data_Visualization_LoadTest.sh >> /var/log/growin_data_visualization_web_loadtest.log 2>&1
# Declare variables
ENV="INT"
USER=335
DURATION="2h"
NUMSTART=1
RUNBY="LoadTest"
RUNTYPE="LoadTest"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_Data_Visualization || exit 1
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
../../k6 run Growin_Data_Visualization.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Data_Visualization/Web/${RUNTYPE}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_48.html
sleep "$SLEEP"