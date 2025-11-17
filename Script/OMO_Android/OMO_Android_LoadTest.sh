#!/bin/bash

# chmod +x OMO_Android_LoadTest.sh
# ./OMO_Android_LoadTest.sh

# Configuration
ENV="INT"
TOTAL_VUS=320
DURATION="5m"
NUMSTART=101
RUNBY="LoadTest"
RUNTYPE="LoadTest"
REPORT_GENERATION_DELAY=10m

# ✅ Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# ✅ Get full path to k6
K6_CMD=$(which k6)

echo "Using k6: $K6_CMD"
echo "Bash version: $BASH_VERSION"
echo ""

# ✅ HARDCODED user distribution (no associative arrays needed)
# Format: BP_NAME:VUS_COUNT:USER_START:USER_END
# BP_CONFIGS=(
#     "BP001:14:101:114"
#     "BP002:14:115:128"
#     "BP003:4:129:132"
#     "BP004:4:133:136"
#     "BP005:4:137:140"
#     "BP006:4:141:144"
#     "BP007:4:145:148"
#     "BP008:4:149:152"
#     "BP009:3:153:155"
#     "BP010:3:156:158"
# )
BP_CONFIGS=(
    "BP001:80:101:180"
    "BP002:80:181:260"
    "BP003:20:261:280"
    "BP004:20:281:300"
    "BP005:20:301:320"
    "BP006:20:321:340"
    "BP007:20:341:360"
    "BP008:20:361:380"
    "BP009:20:381:400"
    "BP010:20:401:420"
)

# Get timestamp
dateStr=$(date +%Y%m%d)
timeStr=$(date +%H%M%S)

echo "=========================================="
echo "Load Test - Concurrent Execution"
echo "=========================================="
echo "Script Directory : $SCRIPT_DIR"
echo "Base Directory   : $BASE_DIR"
echo "k6 Command       : $K6_CMD"
echo "Total VUs        : $TOTAL_VUS"
echo "Duration         : $DURATION"
echo "Environment      : $ENV"
echo "Report Delay     : ${REPORT_GENERATION_DELAY}s"
echo "Start Time       : $(date)"
echo "=========================================="
echo ""

# Display VU distribution
echo "VU Distribution & User Assignment:"
echo "----------------------------------------"
TOTAL_ALLOCATED=0

for config in "${BP_CONFIGS[@]}"; do
    IFS=':' read -r bp vus user_start user_end <<< "$config"
    TOTAL_ALLOCATED=$((TOTAL_ALLOCATED + vus))
    
    # Calculate percentage
    if [ "$vus" -eq 14 ]; then
        percent="25.00"
    else
        percent="6.25"
    fi
    
    if [ "$ENV" == "INT" ]; then
        START_FORMATTED=$(printf "%03d" $user_start)
        END_FORMATTED=$(printf "%03d" $user_end)
        printf "%-8s : %3d VUs (%s%%) | Users: TESTMON%s - TESTMON%s\n" \
            "$bp" "$vus" "$percent" "$START_FORMATTED" "$END_FORMATTED"
    else
        printf "%-8s : %3d VUs (%s%%) | Users: %d - %d\n" \
            "$bp" "$vus" "$percent" "$user_start" "$user_end"
    fi
done

echo "----------------------------------------"
printf "%-8s : %3d VUs | Total Users: 101 - 158 (58 users)\n" "TOTAL" "$TOTAL_ALLOCATED"
echo "=========================================="
echo ""

# Check signature file for BP009
if [ -f "$SCRIPT_DIR/signature.jpeg" ]; then
    echo "✅ Signature file found: signature.jpeg"
else
    echo "⚠️  Warning: signature.jpeg not found (required for BP009)"
    echo "   Creating dummy signature file..."
    if command -v convert &> /dev/null; then
        convert -size 100x100 xc:white "$SCRIPT_DIR/signature.jpeg"
        echo "   ✅ Dummy signature.jpeg created"
    else
        echo "   ❌ ImageMagick not found. BP009 may fail."
    fi
fi
echo ""

# Array to store PIDs and BP names
PIDS=()
BP_NAMES=()

# ✅ Create report directories for each BP
for config in "${BP_CONFIGS[@]}"; do
    IFS=':' read -r bp vus user_start user_end <<< "$config"
    mkdir -p "$BASE_DIR/Report/OMO_Android/${bp}/${RUNTYPE}"
done

echo "Starting tests..."
echo ""

# ✅ Start all BP tests WITHOUT web-dashboard (let handleSummary generate reports)
for config in "${BP_CONFIGS[@]}"; do
    IFS=':' read -r bp vus user_start user_end <<< "$config"
    
    # Calculate percentage
    if [ "$vus" -eq 14 ]; then
        percent="25.00"
    else
        percent="6.25"
    fi
    
    echo "🚀 Starting $bp with $vus VUs ($percent%)"
    echo "   Users: $user_start - $user_end"
    
    if [ "$ENV" == "INT" ]; then
        START_FORMATTED=$(printf "%03d" $user_start)
        END_FORMATTED=$(printf "%03d" $user_end)
        echo "   (TESTMON$START_FORMATTED - TESTMON$END_FORMATTED)"
    fi
    
    # ✅ Run without web-dashboard to avoid port conflicts
    ../../k6 run "$SCRIPT_DIR/${bp}.js" \
      -e RUNBY="$RUNBY" \
      -e ENV="$ENV" \
      -e USER="$vus" \
      -e DURATION="$DURATION" \
      -e NUMSTART="$user_start" \
      --out dashboard=export=${BASE_DIR}/Report/OMO_Android/${bp}/${RUNTYPE}/"$RUNBY"_"$RUNTYPE"_${dateStr}_${timeStr}_${bp}_72.html \
      --quiet \
      > "$BASE_DIR/Report/OMO_Android/${bp}/${RUNTYPE}/${RUNBY}_${RUNTYPE}_${dateStr}_${timeStr}_${bp}_console.log" 2>&1 &
    
    local_pid=$!
    PIDS+=($local_pid)
    BP_NAMES+=($bp)
    
    echo "   PID: $local_pid"
    echo "   Report: ${bp}/${RUNTYPE}/${RUNBY}_Detail_${bp}_*.html (via handleSummary)"
    echo ""
    
    sleep 3
done

echo "=========================================="
echo "✅ All tests started in parallel"
echo "=========================================="
echo "PIDs: ${PIDS[@]}"
echo ""
echo "⏳ Tests are running for $DURATION..."
echo ""
echo "Monitor console logs:"
echo "  tail -f $BASE_DIR/Report/OMO_Android/BP*/${RUNTYPE}/*_console.log"
echo ""
echo "Check running processes:"
echo "  ps -p $(IFS=,; echo "${PIDS[*]}")"
echo ""
echo "Waiting for completion..."
echo ""

# ✅ Wait for all processes to complete with progress tracking
SUCCESS_COUNT=0
FAILED_COUNT=0
FAILED_BPS=()
COMPLETED_BPS=()

for i in "${!PIDS[@]}"; do
    pid=${PIDS[$i]}
    bp_name=${BP_NAMES[$i]}
    
    if wait $pid; then
        echo "✅ $bp_name (PID: $pid) completed successfully"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        COMPLETED_BPS+=($bp_name)
        
        # ✅ Give time for report generation after each completion
        echo "   ⏳ Waiting ${REPORT_GENERATION_DELAY}s for report generation..."
        sleep $REPORT_GENERATION_DELAY
        
    else
        exit_code=$?
        echo "❌ $bp_name (PID: $pid) failed with exit code: $exit_code"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        FAILED_BPS+=($bp_name)
        
        # Show last 30 lines of console log for better debugging
        echo "   Last 30 lines of console log:"
        tail -30 "$BASE_DIR/Report/OMO_Android/${bp_name}/${RUNTYPE}/${RUNBY}_${RUNTYPE}_${dateStr}_${timeStr}_${bp_name}_console.log" | sed 's/^/   /'
        echo ""
    fi
done

echo ""
echo "=========================================="
echo "⏳ All tests completed. Finalizing reports..."
echo "=========================================="
echo ""

# ✅ Additional wait time for all reports to be fully written
FINAL_WAIT=60
echo "Waiting ${FINAL_WAIT}s for all reports to be finalized..."
for i in $(seq 1 $FINAL_WAIT); do
    echo -n "."
    sleep 1
done
echo ""
echo ""

echo "=========================================="
echo "Load Test Summary"
echo "=========================================="
echo "End Time         : $(date)"
echo "Total Tests      : ${#BP_CONFIGS[@]}"
echo "Successful       : $SUCCESS_COUNT"
echo "Failed           : $FAILED_COUNT"

if [ $FAILED_COUNT -gt 0 ]; then
    echo ""
    echo "Failed Tests:"
    for failed_bp in "${FAILED_BPS[@]}"; do
        echo "  - $failed_bp"
        echo "    Console Log: $BASE_DIR/Report/OMO_Android/${failed_bp}/${RUNTYPE}/${RUNBY}_${RUNTYPE}_${dateStr}_${timeStr}_${failed_bp}_console.log"
    done
fi

if [ $SUCCESS_COUNT -gt 0 ]; then
    echo ""
    echo "Completed Tests:"
    for completed_bp in "${COMPLETED_BPS[@]}"; do
        echo "  ✅ $completed_bp"
    done
fi

echo ""
echo "📊 Final Dashboard Reports (HTML files):"
echo "----------------------------------------"
REPORT_COUNT=0

for config in "${BP_CONFIGS[@]}"; do
    IFS=':' read -r bp vus user_start user_end <<< "$config"
    
    # ✅ Look for reports generated by handleSummary
    report_found=false
    
    # Search for LoadTest_Detail_BP*.html pattern
    for report_path in "$BASE_DIR/Report/OMO_Android/${bp}/${RUNTYPE}/${RUNBY}_Detail_${bp}"_*.html; do
        if [ -f "$report_path" ]; then
            report_found=true
            file_size=$(du -h "$report_path" | cut -f1)
            report_name=$(basename "$report_path")
            echo "  ✅ $bp: Report/OMO_Android/${bp}/${RUNTYPE}/${report_name} ($file_size)"
            REPORT_COUNT=$((REPORT_COUNT + 1))
            break
        fi
    done
    
    if [ "$report_found" = false ]; then
        echo "  ❌ $bp: Report not found"
        echo "     Expected: ${RUNBY}_Detail_${bp}_*.html"
    fi
done

echo "----------------------------------------"
echo "Total Reports Generated: $REPORT_COUNT / ${#BP_CONFIGS[@]}"
echo "=========================================="

if [ $FAILED_COUNT -gt 0 ]; then
    echo ""
    echo "❌ Some tests failed. Check logs for details."
    exit 1
fi

if [ $REPORT_COUNT -lt ${#BP_CONFIGS[@]} ]; then
    echo ""
    echo "⚠️  Warning: Not all reports were generated successfully."
    exit 1
fi

echo ""
echo "✅ All tests completed successfully with reports!"
echo ""
echo "Open all reports:"
echo "  firefox $BASE_DIR/Report/OMO_Android/BP*/${RUNTYPE}/${RUNBY}_Detail_*.html 2>/dev/null &"
echo ""
exit 0