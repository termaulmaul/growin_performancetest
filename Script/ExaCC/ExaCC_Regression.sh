#!/bin/bash

# chmod +x ExaCC_Regression.sh
# ./ExaCC_Regression.sh
# Declare variables
ENV="INT"
USER=335
DURATION="15m"
NUMSTART=1
RUNBY="Regression"
RUNTYPE="DryRun"
SLEEP=300

pwd
cd /home/qa/mostng_performancetest_api/Script/ExaCC || exit 1
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
../../k6 run ExaCC.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP001 -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/BP001/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP001_72.html
sleep "$SLEEP"

#BP002
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and timexw
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP002 Web"

# Run k6 commands using the captured date and times
../../k6 run ExaCC.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP002 -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/BP002/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP002_72.html
sleep "$SLEEP"

#BP003
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and timexw
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP003 Web"

# Run k6 commands using the captured date and times
../../k6 run ExaCC.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP003 -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/BP003/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP003_72.html
sleep "$SLEEP"

#BP004
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and timexw
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP004 Web"

# Run k6 commands using the captured date and times
../../k6 run ExaCC.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP004 -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/BP004/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP004_72.html
sleep "$SLEEP"

#BP005
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and timexw
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP005 Web"

# Run k6 commands using the captured date and times
../../k6 run ExaCC.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP005 -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/BP005/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP005_72.html
sleep "$SLEEP"

#BP006
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and timexw
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP006 Web"

# Run k6 commands using the captured date and times
../../k6 run ExaCC.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP006 -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/BP006/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP006_72.html
sleep "$SLEEP"

#BP007
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and timexw
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP007 Web"

# Run k6 commands using the captured date and times
../../k6 run ExaCC.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP007 -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/BP007/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP007_72.html
sleep "$SLEEP"

#BP008
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and timexw
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP008 Web"

# Run k6 commands using the captured date and times
../../k6 run ExaCC.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP008 -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/BP008/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP008_72.html
sleep "$SLEEP"

#BP009
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and timexw
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP009 Web"

# Run k6 commands using the captured date and times
../../k6 run ExaCC.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP009 -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/BP009/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP009_72.html
sleep "$SLEEP"

#BP010
# Get the current date and time in the desired format using the date command
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

# Verify the captured date and timexw
echo "Captured Date    : $dateStr"
echo "Captured Time    : $timeStr"
echo "Current Scenario : BP010 Web"

# Run k6 commands using the captured date and times
../../k6 run ExaCC.js -e RUNBY="$RUNBY" -e ENV="$ENV" -e USER="$USER" -e DURATION="$DURATION" -e NUMSTART="$NUMSTART" -e SCENARIO=BP010 -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/BP010/${RUNBY}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_BP010_72.html
sleep "$SLEEP"