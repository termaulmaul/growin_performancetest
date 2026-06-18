import http from "k6/http";
import { Counter } from "k6/metrics";

// Metrics untuk tracking channel fetching issues
export const ChannelMetrics = {
    noChannelFound: new Counter("no_channel_found"),
    serverErrorEncountered: new Counter("server_error_encountered_channel"),
};

/**
 * Fetch channel_id untuk user dengan fallback strategy:
 * 1. Coba ambil JOINED channel dari joined-by-user
 * 2. Fallback ke get-list jika tidak ada JOINED
 * 3. Fallback terakhir ke LEFT channel jika semua gagal
 * 
 * @param {string} base_url - Base URL API
 * @param {string} token - Access token user
 * @param {string} bp - Business process name untuk logging
 * @param {boolean} isIntEnv - Apakah environment INT (untuk suppress logging)
 * @returns {string|null} channel_id atau null jika tidak ditemukan
 */
export function getChannelId(base_url, token, bp, isIntEnv = false) {
    const channelListHeaders = {
        'Cookie': `ACCESS_TOKEN=${token}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': '*/*',
    };

    let channelData = null;
    let channel_id = null;

    // Step 1: Coba ambil dari joined-by-user dengan filter JOINED
    let channelListRes = http.get(
        `${base_url}/socialinvesting/api/v1/channel/joined-by-user`, 
        { headers: channelListHeaders }
    );

    if (channelListRes.status === 200) {
        try {
            channelData = channelListRes.json();
            
            if (channelData && channelData.data && Array.isArray(channelData.data) && channelData.data.length > 0) {
                const joinedChannels = channelData.data.filter(ch => ch.join_status === "JOINED");
                
                if (joinedChannels.length > 0) {
                    channel_id = joinedChannels[0].channel_id;
                    if (!isIntEnv) {
                        console.log(`   ✅ ${bp} found JOINED channel: ${channel_id}`);
                    }
                } else {
                    if (!isIntEnv) {
                        console.log(`   ⚠️  ${bp} - No JOINED channels found in joined-by-user, trying get-list...`);
                    }
                }
            } else {
                if (!isIntEnv) {
                    console.log(`   ⚠️  ${bp} - Empty or invalid response from joined-by-user, trying get-list...`);
                }
            }
        } catch (e) {
            console.error(`   ❌ ${bp} - Failed to parse joined-by-user: ${e.message}`);
        }
    } else {
        ChannelMetrics.serverErrorEncountered.add(1);
        console.error(`   ❌ ${bp} - joined-by-user failed (${channelListRes.status}), trying get-list...`);
    }

    // Step 2: Fallback ke get-list jika tidak dapat JOINED channel
    if (channel_id == null) {
        let getListRes = http.get(
            `${base_url}/socialinvesting/api/v1/channel/get-list`, 
            { headers: channelListHeaders }
        );
        
        if (getListRes.status === 200) {
            try {
                const listData = getListRes.json();
                if (listData && listData.data && Array.isArray(listData.data) && listData.data.length > 0) {
                    channel_id = listData.data[0].channel_id;
                    if (!isIntEnv) {
                        console.log(`   ✅ ${bp} fallback channel from get-list: ${channel_id}`);
                    }
                } else {
                    if (!isIntEnv) {
                        console.log(`   ⚠️  ${bp} - Empty or invalid response from get-list, trying LEFT channels...`);
                    }
                }
            } catch (e) {
                console.error(`   ❌ ${bp} - Failed to parse get-list: ${e.message}`);
            }
        } else {
            ChannelMetrics.serverErrorEncountered.add(1);
            console.error(`   ❌ ${bp} - get-list failed (${getListRes.status}), trying LEFT channels...`);
        }
    }

    // Step 3: Fallback terakhir ke LEFT channels jika get-list kosong
    if (channel_id == null) {
        // Guard clause - pastikan channelData valid sebelum diakses
        if (!channelData || !channelData.data || !Array.isArray(channelData.data)) {
            console.error(`   ❌ ${bp} - No valid channel data available from any source, aborting`);
            ChannelMetrics.noChannelFound.add(1);
            return null;
        }
        
        try {
            const leftedChannels = channelData.data.filter(ch => ch.join_status === "LEFT");
            
            if (leftedChannels.length > 0) {
                channel_id = leftedChannels[0].channel_id;
                if (!isIntEnv) {
                    console.log(`   ⚠️  ${bp} using LEFT channel as last resort: ${channel_id}`);
                }
            } else {
                console.error(`   ❌ ${bp} - No channels available (no JOINED, no get-list, no LEFT)`);
                ChannelMetrics.noChannelFound.add(1);
                return null;
            }
        } catch (e) {
            console.error(`   ❌ ${bp} - Error filtering LEFT channels: ${e.message}`);
            ChannelMetrics.noChannelFound.add(1);
            return null;
        }
    }

    return channel_id;
}

/**
 * Alternatif: Fetch channel_id dengan options lebih fleksibel
 * 
 * @param {Object} options - Configuration object
 * @param {string} options.base_url - Base URL API
 * @param {string} options.token - Access token user
 * @param {string} options.bp - Business process name untuk logging
 * @param {boolean} options.isIntEnv - Apakah environment INT
 * @param {boolean} options.allowLeftChannels - Apakah boleh gunakan LEFT channels (default: true)
 * @param {string} options.preferredStatus - Preferred join_status (default: "JOINED")
 * @returns {string|null} channel_id atau null jika tidak ditemukan
 */
export function getChannelIdWithOptions(options) {
    const {
        base_url,
        token,
        bp,
        isIntEnv = false,
        allowLeftChannels = true,
        preferredStatus = "JOINED"
    } = options;

    const channelListHeaders = {
        'Cookie': `ACCESS_TOKEN=${token}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': '*/*',
    };

    let channelData = null;
    let channel_id = null;

    // Step 1: Coba ambil dari joined-by-user
    let channelListRes = http.get(
        `${base_url}/socialinvesting/api/v1/channel/joined-by-user`, 
        { headers: channelListHeaders }
    );

    if (channelListRes.status === 200) {
        try {
            channelData = channelListRes.json();
            
            if (channelData && channelData.data && Array.isArray(channelData.data) && channelData.data.length > 0) {
                const preferredChannels = channelData.data.filter(ch => ch.join_status === preferredStatus);
                
                if (preferredChannels.length > 0) {
                    channel_id = preferredChannels[0].channel_id;
                    if (!isIntEnv) {
                        console.log(`   ✅ ${bp} found ${preferredStatus} channel: ${channel_id}`);
                    }
                    return channel_id;
                }
            }
        } catch (e) {
            console.error(`   ❌ ${bp} - Failed to parse joined-by-user: ${e.message}`);
        }
    } else {
        ChannelMetrics.serverErrorEncountered.add(1);
    }

    // Step 2: Fallback ke get-list
    if (channel_id == null) {
        let getListRes = http.get(
            `${base_url}/socialinvesting/api/v1/channel/get-list`, 
            { headers: channelListHeaders }
        );
        
        if (getListRes.status === 200) {
            try {
                const listData = getListRes.json();
                if (listData && listData.data && Array.isArray(listData.data) && listData.data.length > 0) {
                    channel_id = listData.data[0].channel_id;
                    if (!isIntEnv) {
                        console.log(`   ✅ ${bp} fallback channel from get-list: ${channel_id}`);
                    }
                    return channel_id;
                }
            } catch (e) {
                console.error(`   ❌ ${bp} - Failed to parse get-list: ${e.message}`);
            }
        } else {
            ChannelMetrics.serverErrorEncountered.add(1);
        }
    }

    // Step 3: LEFT channels (jika diizinkan)
    if (channel_id == null && allowLeftChannels) {
        if (!channelData || !channelData.data || !Array.isArray(channelData.data)) {
            console.error(`   ❌ ${bp} - No valid channel data available`);
            ChannelMetrics.noChannelFound.add(1);
            return null;
        }
        
        try {
            const leftedChannels = channelData.data.filter(ch => ch.join_status === "LEFT");
            
            if (leftedChannels.length > 0) {
                channel_id = leftedChannels[0].channel_id;
                if (!isIntEnv) {
                    console.log(`   ⚠️  ${bp} using LEFT channel: ${channel_id}`);
                }
                return channel_id;
            }
        } catch (e) {
            console.error(`   ❌ ${bp} - Error filtering LEFT channels: ${e.message}`);
        }
    }

    ChannelMetrics.noChannelFound.add(1);
    return null;
}