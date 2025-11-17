#!/bin/bash

# chmod +x Growin_Eipo_Stock_Regression.sh
# ./Growin_Eipo_Stock_Regression.sh
# Declare variables
ENV="INT"
USER=205
DURATION="15m"
NUMSTART=101
RUNBY="Regression"
RUNTYPE="DryRun"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/Growin_Community/Web || exit 1
pwd

#BP001
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP001"

# Run k6 commands using the captured date and time
../../../k6 run BP001.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP001/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_72.html

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
../../../k6 run BP002.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP002/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP002_72.html

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
../../../k6 run BP003.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP003/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP003_72.html

sleep "$SLEEP"

# #BP004
# # Get the current date and time in the desired format using the date command
# dateStr=$(date +%Y%m%d)
# timeStr=$(date +%H%M%S)

# # Verify the captured date and time
# echo "Captured Date    : $dateStr"
# echo "Captured Time    : $timeStr"
# echo "Current Scenario : BP004"

# # Run k6 commands using the captured date and time
# ../../../k6 run BP004.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP004/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP004_72.html

sleep "$SLEEP"

#BP005
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP005"

# Run k6 commands using the captured date and time
../../../k6 run BP005.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP005/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP005_72.html

sleep "$SLEEP"

#BP006
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP006"

# Run k6 commands using the captured date and time
../../../k6 run BP006.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP006/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP006_72.html

sleep "$SLEEP"

#BP007
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP007"

# Run k6 commands using the captured date and time
../../../k6 run BP007.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP007/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP007_72.html

sleep "$SLEEP"

# #BP008
# # Get the current date and time in the desired format using the date command
# dateStr=$(date +%Y%m%d)
# timeStr=$(date +%H%M%S)

# # Verify the captured date and time
# echo "Captured Date    : $dateStr"
# echo "Captured Time    : $timeStr"
# echo "Current Scenario : BP008"

# # Run k6 commands using the captured date and time
# ../../../k6 run BP008.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP008/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP008_72.html

# sleep "$SLEEP"

#BP009
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP009"

# Run k6 commands using the captured date and time
../../../k6 run BP009.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP009/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP009_72.html

sleep "$SLEEP"

#BP010
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP010"

# Run k6 commands using the captured date and time
../../../k6 run BP010.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP010/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP010_72.html

sleep "$SLEEP"

# #BP011
# # Get the current date and time in the desired format using the date command
# dateStr=$(date +%Y%m%d)
# timeStr=$(date +%H%M%S)

# # Verify the captured date and time
# echo "Captured Date    : $dateStr"
# echo "Captured Time    : $timeStr"
# echo "Current Scenario : BP011"

# # Run k6 commands using the captured date and time
# ../../../k6 run BP011.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP011/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP011_72.html

sleep "$SLEEP"

#BP012
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and time
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP012"

# Run k6 commands using the captured date and time
../../../k6 run BP012.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP012/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP012_72.html

sleep "$SLEEP"

# #BP013
# # Get the current date and time in the desired format using the date command
# dateStr=$(date +%Y%m%d)
# timeStr=$(date +%H%M%S)

# # Verify the captured date and time
# echo "Captured Date    : $dateStr"
# echo "Captured Time    : $timeStr"
# echo "Current Scenario : BP013"

# # Run k6 commands using the captured date and time
# ../../../k6 run BP013.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP013/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP013_72.html

# sleep "$SLEEP"

# #BP014
# # Get the current date and time in the desired format using the date command
# dateStr=$(date +%Y%m%d)
# timeStr=$(date +%H%M%S)

# # Verify the captured date and time
# echo "Captured Date    : $dateStr"
# echo "Captured Time    : $timeStr"
# echo "Current Scenario : BP014"

# # Run k6 commands using the captured date and time
# ../../../k6 run BP014.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" --out dashboard=export=../../../Report/Growin_Community/Web/BP014/Regression/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP014_72.html

# sleep "$SLEEP"