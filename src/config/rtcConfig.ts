// This object is provided as `config.rtcConfig` to Trystero's `joinRoom`
// function: https://github.com/dmotz/trystero#joinroomconfig-namespace
//
// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection#parameters
export const rtcConfig: RTCConfiguration = {
  // These are the relay servers that are used in case a direct peer-to-peer
  // connection cannot be made. Feel free to change them as you'd like. If you
  // would like to disable relay servers entirely, remove the `iceServers`
  // property from the rtcConfig object. IF YOU DISABLE RELAY SERVERS,
  // CHITCHATTER PEERS MAY NOT BE ABLE TO CONNECT DEPENDING ON HOW THEY ARE
  // CONNECTED TO THE INTERNET.
  iceServers: [
    // STUN servers for direct connections (primary)
    { urls: ['stun:stun.cloudflare.com:3478'] },
    { urls: ['stun:stun.l.google.com:19302'] },
    { urls: ['stun:stun1.l.google.com:19302'] },
    { urls: ['stun:stun2.l.google.com:19302'] },
    { urls: ['stun:stun.services.mozilla.com'] },
    // TURN server for fallback when STUN fails
    {
      urls: ['turn:relay1.expressturn.com:3480'],
      username: '000000002073803445',
      credential: '3iSwN8gOD2f0gLPEIw3MJCm6sRw=',
    },
  ],
}
