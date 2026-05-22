#!/bin/bash

# chmod +x Growin_Data_Visualization_Regression.sh
# ./Growin_Data_Visualization_Regression.sh
# 20 00 * * 1-5 /home/qa/mostng_performancetest_api/Script/Growin_Data_Visualization/Growin_Data_Visualization_Regression.sh >> /var/log/growin_data_visualization_regression.log 2>&1
# Declare variables
ENV="INT"
USER=335
DURATION="15m"
NUMSTART=1
RUNBY="Regression"
RUNTYPE="DryRun"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_Data_Visualization || exit 1
pwd

#BP001
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and timexw
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP001 Web"

# Run k6 commands using the captured date and times
../../k6 run Growin_Data_Visualization.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP001 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Data_Visualization/Web/BP001/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_48.html
sleep "$SLEEP"

