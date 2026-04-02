#!/bin/bash

# chmod +x Optimize_Trading_Personal_Profile_Regression.sh
# ./Optimize_Trading_Personal_Profile_Regression.sh
# Declare variables
ENV="INT"
USER=400
DURATION="15m"
NUMSTART=1
RUNBY="Regression"
RUNTYPE="DryRun"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_Calendar || exit 1
pwd

#BP001
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP001 Android"

# Run k6 commands using the captured date and time
../../k6 run Growin_Calendar.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP001 -e PLATFORM=Android --out dashboard=export=../../Report/Growin_Calendar/Android/BP001/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_48.html
sleep "$SLEEP"

#BP002
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP002 Android"

# Run k6 commands using the captured date and time
../../k6 run Growin_Calendar.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP002 -e PLATFORM=Android --out dashboard=export=../../Report/Growin_Calendar/Android/BP002/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP002_48.html
sleep "$SLEEP"

#BP001
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP001 iOS"

# Run k6 commands using the captured date and time
../../k6 run Growin_Calendar.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP001 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Calendar/iOS/BP001/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_48.html
sleep "$SLEEP"

#BP002
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP002 iOS"

# Run k6 commands using the captured date and time
../../k6 run Growin_Calendar.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP002 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Calendar/iOS/BP002/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP002_48.html
sleep "$SLEEP"

#BP001
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP001 Web"

# Run k6 commands using the captured date and time
../../k6 run Growin_Calendar.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP001 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Calendar/Web/BP001/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_48.html
sleep "$SLEEP"