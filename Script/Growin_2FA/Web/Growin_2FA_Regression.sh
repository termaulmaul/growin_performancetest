#!/bin/bash

# chmod +x Growin_2FA_Regression.sh
# ./Growin_2FA_Regression.sh
# Declare variables
ENV="INT"
USERBP2=150
USERBP3=300
DURATION="15m"
NUMSTART=1
RUNBY="Regression"
RUNTYPE="DryRun"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_2FA/Web || exit 1
pwd

# #BP001
# # Get the current date and time in the desired format using the date command
# dateStr=$(date +%Y%m%d)
# timeStr=$(date +%H%M%S)

# # Verify the captured date and time
# echo "Captured Date    : $dateStr"
# echo "Captured Time    : $timeStr"
# echo "Current Scenario : BP001"

# # Run k6 commands using the captured date and time
# ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP001 --out dashboard=export=../../../Report/Growin_2FA/Web/BP001/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_72.html
# sleep "$SLEEP"

#BP002
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP002"

# Run k6 commands using the captured date and time
../../../k6 run Growin_2FA_LoadTest.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USERBP2" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP002 --out dashboard=export=../../../Report/Growin_2FA/Web/BP002/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP002_72.html

sleep "$SLEEP"

# #BP003
# # Get the current date and time in the desired format using the date command
# dateStr=$(date +%Y%m%d)
# timeStr=$(date +%H%M%S)

# # Verify the captured date and time
# echo "Captured Date    : $dateStr"
# echo "Captured Time    : $timeStr"
# echo "Current Scenario : BP003"

# # Run k6 commands using the captured date and time
# ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USERBP3" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP003 --out dashboard=export=../../../Report/Growin_2FA/Web/BP003/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP003_72.html