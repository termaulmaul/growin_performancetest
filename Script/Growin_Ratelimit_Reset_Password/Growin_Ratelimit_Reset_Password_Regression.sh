#!/bin/bash

# chmod +x Growin_Ratelimit_Reset_Password_Regression.sh
# ./Growin_Ratelimit_Reset_Password_Regression.sh
# Declare variables
ENV="INT"
USER=250
DURATION="15m"
NUMSTART=1
RUNBY="Regression"
RUNTYPE="DryRun"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_Ratelimit_Reset_Password || exit 1
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
../../k6 run Growin_Ratelimit_Reset_Password.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART=1501 -e SCENARIO=BP001 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Ratelimit_Reset_Password/Web/BP001/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_72.html
sleep "$SLEEP"

#BP002
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP002 Web"

# Run k6 commands using the captured date and time
../../k6 run Growin_Ratelimit_Reset_Password.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART=1 -e SCENARIO=BP002 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Ratelimit_Reset_Password/Web/BP002/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP002_72.html
sleep "$SLEEP"