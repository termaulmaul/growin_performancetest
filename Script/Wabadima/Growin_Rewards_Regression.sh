#!/bin/bash

# chmod +x Growin_Rewards_Regression.sh
# ./Growin_Rewards_Regression.sh
# Declare variables
ENV="INT"
USER=205
DURATION="15m"
NUMSTART=101
RUNBY="Regression"
RUNTYPE="DryRun"
SLEEP=300

#BP001
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP001"

# Run k6 commands using the captured date and time
../../k6 run BP001.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../Report/Growin_Rewards/BP001/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_72.html

sleep "$SLEEP"

#BP002
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP002"

# Run k6 commands using the captured date and time
../../k6 run BP002.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../Report/Growin_Rewards/BP002/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP002_72.html

sleep "$SLEEP"

#BP003
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP003"

# Run k6 commands using the captured date and time
../../k6 run BP003.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../Report/Growin_Rewards/BP003/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP003_72.html

sleep "$SLEEP"

#BP004
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP004"

# Run k6 commands using the captured date and time
../../k6 run BP004.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../Report/Growin_Rewards/BP004/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP004_72.html