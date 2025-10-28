#!/usr/bin/env python3
"""
TURN Server Connectivity Test Script
Tests connectivity to Xirsys TURN servers using aiortc
"""

import asyncio
import json
import time
from aiortc import RTCPeerConnection
from aiortc.rtcconfiguration import RTCConfiguration, RTCIceServer


def get_timestamp():
    """Get current timestamp for logging"""
    return time.strftime("%H:%M:%S")


async def test_turn_configuration(config, test_name, timeout=10):
    """Test a specific TURN configuration"""
    try:
        print(f"[{get_timestamp()}] [INFO] Starting {test_name} test...")
        
        # Create peer connection with the configuration
        pc = RTCPeerConnection(config)
        
        # Store candidates
        candidates = []
        relay_candidates = []
        
        def on_ice_candidate(candidate):
            if candidate:
                candidates.append(candidate)
                print(f"[{get_timestamp()}] [INFO] Found candidate: {candidate.type} - {candidate.address}:{candidate.port}")
                if candidate.type == "relay":
                    relay_candidates.append(candidate)
                    print(f"[{get_timestamp()}] [INFO] Found relay candidate: {candidate.address}:{candidate.port}")
        
        def on_ice_gathering_state_change():
            print(f"[{get_timestamp()}] [INFO] ICE gathering state changed to: {pc.iceGatheringState}")
        
        def on_ice_connection_state_change():
            print(f"[{get_timestamp()}] [INFO] ICE connection state changed to: {pc.iceConnectionState}")
        
        # Set up event handlers
        pc.onicecandidate = on_ice_candidate
        pc.onicegatheringstatechange = on_ice_gathering_state_change
        pc.oniceconnectionstatechange = on_ice_connection_state_change
        
        # Create a data channel to trigger ICE gathering
        data_channel = pc.createDataChannel("test")
        
        # Create offer to trigger ICE gathering
        offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        print(f"[{get_timestamp()}] [INFO] Local description set, ICE gathering state: {pc.iceGatheringState}")
        
        # Wait for ICE gathering to complete or timeout
        start_time = time.time()
        while pc.iceGatheringState != "complete" and (time.time() - start_time) < timeout:
            await asyncio.sleep(0.1)
        
        print(f"[{get_timestamp()}] [INFO] Final ICE gathering state: {pc.iceGatheringState}")
        print(f"[{get_timestamp()}] [INFO] ICE connection state: {pc.iceConnectionState}")
        
        # Wait a bit more to ensure all candidates are gathered
        await asyncio.sleep(2)
        
        # Clean up
        await pc.close()
        
        duration = time.time() - start_time
        
        # Analyze results
        success = len(relay_candidates) > 0 if "TURN-Only" in test_name else len(candidates) > 0
        
        result = {
            "test_name": test_name,
            "success": success,
            "duration": duration,
            "total_candidates": len(candidates),
            "relay_candidates": len(relay_candidates),
            "error": None
        }
        
        if success:
            print(f"[{get_timestamp()}] [SUCCESS] {test_name}: Found {len(candidates)} candidates ({len(relay_candidates)} relay)")
        else:
            print(f"[{get_timestamp()}] [WARNING] {test_name}: No suitable candidates found")
        
        return result
        
    except Exception as e:
        print(f"[{get_timestamp()}] [ERROR] Error in {test_name}: {str(e)}")
        return {
            "test_name": test_name,
            "success": False,
            "duration": 0,
            "total_candidates": 0,
            "relay_candidates": 0,
            "error": str(e)
        }


def load_xirsys_config():
    """Load Xirsys configuration from file"""
    try:
        with open('xirsys-config.json', 'r') as f:
            config = json.load(f)
        print(f"[{get_timestamp()}] [INFO] Loaded Xirsys config from xirsys-config.json")
        return config
    except FileNotFoundError:
        print(f"[{get_timestamp()}] [ERROR] xirsys-config.json not found")
        return None
    except json.JSONDecodeError as e:
        print(f"[{get_timestamp()}] [ERROR] Invalid JSON in xirsys-config.json: {e}")
        return None


def convert_to_aiortc_config(ice_servers):
    """Convert ice servers format for aiortc"""
    rtc_ice_servers = []
    for server in ice_servers:
        urls = server.get('urls', [])
        if isinstance(urls, str):
            urls = [urls]
        
        for url in urls:
            ice_server = RTCIceServer(url)
            if 'username' in server:
                ice_server.username = server['username']
            if 'credential' in server:
                ice_server.credential = server['credential']
            rtc_ice_servers.append(ice_server)
            print(f"[{get_timestamp()}] [INFO] Added ICE server: {url}")
    
    print(f"[{get_timestamp()}] [INFO] Created RTC configuration with {len(rtc_ice_servers)} ICE servers")
    return RTCConfiguration(rtc_ice_servers)


async def main():
    """Main test function"""
    print(f"[{get_timestamp()}] [INFO] Starting TURN server connectivity tests...")
    
    # Load Xirsys configuration
    xirsys_config = load_xirsys_config()
    if not xirsys_config:
        print(f"[{get_timestamp()}] [ERROR] Cannot proceed without Xirsys configuration")
        return
    
    # Extract ice servers
    ice_servers = xirsys_config.get('iceServers', [])
    if not ice_servers:
        print(f"[{get_timestamp()}] [ERROR] No iceServers found in configuration")
        return
    
    # Create test configurations
    configs = []
    
    # Test 1: Xirsys Config File (original configuration)
    original_config = convert_to_aiortc_config(ice_servers)
    configs.append(('Xirsys Config File', original_config))
    
    # Test 2: Xirsys TURN (Current Config) - same as original
    configs.append(('Xirsys TURN (Current Config)', original_config))
    
    # Test 3: Xirsys TURN-Only (Relay Forced) - filter to TURN servers only
    turn_servers = [server for server in ice_servers if any('turn:' in url for url in server.get('urls', []))]
    if turn_servers:
        turn_only_config = convert_to_aiortc_config(turn_servers)
        configs.append(('Xirsys TURN-Only (Relay Forced)', turn_only_config))
    
    # Test 4: STUN-Only (No TURN) - filter to STUN servers only
    stun_servers = [server for server in ice_servers if any('stun:' in url for url in server.get('urls', []))]
    if stun_servers:
        stun_only_config = convert_to_aiortc_config(stun_servers)
        configs.append(('STUN-Only (No TURN)', stun_only_config))
    
    # Run tests
    results = []
    for test_name, config in configs:
        result = await test_turn_configuration(config, test_name)
        results.append(result)
    
    # Print summary
    print("\n" + "="*60)
    print("TURN SERVER TEST SUMMARY")
    print("="*60)
    
    passed_tests = sum(1 for r in results if r["success"])
    total_tests = len(results)
    
    print(f"Tests passed: {passed_tests}/{total_tests}")
    print(f"Overall success rate: {passed_tests/total_tests*100:.1f}%")
    print()
    
    for result in results:
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        print(f"{status} {result['test_name']}")
        if result["error"]:
            print(f"  Error: {result['error']}")
        else:
            print(f"  Duration: {result['duration']:.1f}s")
            print(f"  Candidates: {result['total_candidates']} total, {result['relay_candidates']} relay")
        print()


if __name__ == "__main__":
    asyncio.run(main())