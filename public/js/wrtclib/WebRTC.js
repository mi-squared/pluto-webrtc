/**
 * Created by alykoshin on 8/27/14.
 */

/**
 *
 * Some additional definitions for standard WebRTC functions and objects
 *
 */

/**
 * Pair function to attachMediaStream form adapter.js
 * @param element - HTML video element
 *
 */

var detachMediaStream = function( element ) {
  if (typeof element.srcObject !== 'undefined') {
    element.srcObject = '';//stream;
  } else if (typeof element.mozSrcObject !== 'undefined') {
    // TypeError: Value being assigned to HTMLMediaElement.mozSrcObject is not an object.
    // element.mozSrcObject = '';
    element.mozSrcObject = null;
  } else if (typeof element.src !== 'undefined') {
    element.src = '';//URL.createObjectURL(stream);
  } else {
    console.warn('Error detaching stream from element.');
  }
};


/**
 * @typedef {string} DOMString
 */

/**
 * @typedef {number} long
 */

/**
 * @typedef {number} unsigned_short
 */

/**
 * @typedef {{}} DOMError
 */

/**
 * @typedef {function} RTCPeerConnectionErrorCallback
 * @param {DOMError} error
 */
/**
 * @typedef {null} VoidFunction
 */

/**
 enum RTCSdpType {
    "offer",
    "pranswer",
    "answer"
 };
 * @name RTCSdpType
 * @type {string}
 * @see {@link http://dev.w3.org/2011/webrtc/editor/webrtc.html#rtcsdptype}
 */

/**
 * @name RTCSessionDescription
 * @type {{type: RTCSdpType, sdp: DOMString}}
 * @see {@link http://dev.w3.org/2011/webrtc/editor/webrtc.html#rtcsessiondescription-class}
 */

/**
 * type {{candidate: String, sdpMLineIndex: Number, sdpMid: String}}
 * type {{candidate: String, sdpMLineIndex: Number, sdpMid: String}}
 * typedef {{candidate: String, sdpMLineIndex: Number, sdpMid: String}} RTCIceCandidate
 * type {{candidate: DOMString, sdpMLineIndex: unsigned_short, sdpMid: DOMString}}

 * @name RTCIceCandidate
 * @property {DOMString} [candidate]          - candidate of type DOMString, , nullable
 *                                              This carries the candidate-attribute as defined in section 15.1 of [ICE].
 * @property {unsigned_short} [sdpMLineIndex] - sdpMLineIndex of type unsigned short, nullable
 *                                              This indicates the index (starting at zero) of the m-line in the
 *                                              SDP this candidate is associated with.
 * @property {DOMString} [sdpMid]             - sdpMid of type DOMString, nullable
 *                                              If present, this contains the identifier of the "media stream
 *                                              identification" as defined in [RFC3388] for the m-line this
 *                                              candidate is associated with.
 *
 * @see {@link http://dev.w3.org/2011/webrtc/editor/webrtc.html#rtcicecandidate-type}
 */

/**
 * @name RTCPeerConnection
 *
 */
/**
 * @name RTCPeerConnection#createDTMFSender
 * @type function
 * @param {MediaStreamTrack} track
 * @returns {RTCDTMFSender}
 */
/**
 * @name RTCPeerConnection#setLocalDescription
 * @type function
 * @param {RTCSessionDescription} description
 * @param {VoidFunction} [successCallback]
 * @param {RTCPeerConnectionErrorCallback} [failureCallback]
 * @see {@link http://www.w3.org/TR/webrtc/#widl-RTCPeerConnection-setLocalDescription-void-RTCSessionDescription-description-VoidFunction-successCallback-RTCPeerConnectionErrorCallback-failureCallback}
 */
/**
 * @name RTCPeerConnection#setRemoteDescription
 * @type function
 * @param {RTCSessionDescription} description
 * @param {VoidFunction} [successCallback]
 * @param {RTCPeerConnectionErrorCallback} [failureCallback]
 * @see {@link http://www.w3.org/TR/webrtc/#widl-RTCPeerConnection-setRemoteDescription-void-RTCSessionDescription-description-VoidFunction-successCallback-RTCPeerConnectionErrorCallback-failureCallback}
 */
/**
 * @name RTCPeerConnection#addIceCandidate
 * @type function
 * @param {RTCIceCandidate} candidate
 * @param {VoidFunction} [successCallback]
 * @param {RTCPeerConnectionErrorCallback} [failureCallback]
 * @see {@link http://www.w3.org/TR/webrtc/#widl-RTCPeerConnection-addIceCandidate-void-RTCIceCandidate-candidate-VoidFunction-successCallback-RTCPeerConnectionErrorCallback-failureCallback}
 */
/**
 * @name RTCPeerConnection#addStream
 * @type method
 * @param {MediaStream} stream
 * @param {MediaConstraints} [constraints]
 * @see {@link http://www.w3.org/TR/webrtc/#widl-RTCPeerConnection-addStream-void-MediaStream-stream-MediaConstraints-constraints}
 */
/**
 * @name RTCPeerConnection#close
 * @type function
 * @see {@link http://www.w3.org/TR/webrtc/#widl-RTCPeerConnection-close-void}
 */

/**
 The createAnswer method generates an [SDP] answer with the supported configuration for the session that is compatible with the parameters in the remote configuration. Like createOffer, the returned blob contains descriptions of the local MediaStreams attached to this RTCPeerConnection, the codec/RTP/RTCP options negotiated for this session, and any candidates that have been gathered by the ICE Agent. The options parameter may be supplied to provide additional control over the generated answer.
 As an answer, the generated SDP will contain a specific configuration that, along with the corresponding offer, specifies how the media plane should be established. The generation of the SDP must follow the appropriate process for generating an answer.
 Session descriptions generated by createAnswer must be immediately usable by setLocalDescription without generating an error if setLocalDescription is called from the successCallback function. Like createOffer, the returned description should reflect the current state of the system. The session descriptions must remain usable by setLocalDescription without causing an error until at least the end of the successCallback function. Calling this method is needed to get the ICE user name fragment and password.
 An answer can be marked as provisional, as described in [RTCWEB-JSEP], by setting the type to "pranswer".
 If the RTCPeerConnection is configured to generate Identity assertions, then the session description shall contain an appropriate assertion.
 If this RTCPeerConnection object is closed before the SDP generation process completes, the USER agent must suppress the result and not call any of the result callbacks.
 If the SDP generation process completed successfully, the user agent must queue a task to invoke successCallback with a newly created RTCSessionDescription object, representing the generated answer, as its argument.
 If the SDP generation process failed for any reason, the user agent must queue a task to invoke failureCallback with an DOMError object of type TBD as its argument.
 * @name RTCPeerConnection#createAnswer
 * @type function
 */
/**
 * @name RTCPeerConnection#getLocalStreams
 * @type function
 * @memberOf RTCPeerConnection
 * @returns {MediaStream[]}
 */
/**
 * @name RTCPeerConnection#getRemoteStreams
 * @type function
 * @returns {MediaStream[]}
 */
/**
 * @name RTCPeerConnection#onnegotiationneeded        // attribute EventHandler  onnegotiationneeded;
 * @type function
 **/
/**
 * @name RTCPeerConnection#onicecandidate             //attribute EventHandler   onicecandidate;
 * @type function
 **/
/**
 * @name RTCPeerConnection#onsignalingstatechange     // attribute EventHandler  onsignalingstatechange;
 * @type function
 **/
/**
 * @name RTCPeerConnection#onaddstream                // attribute EventHandler  onaddstream;
 * @type function
 **/
/**
 * @name RTCPeerConnection#onremovestream             // attribute EventHandler  onremovestream;
 * @type function
 **/
/**
 * @name RTCPeerConnection#oniceconnectionstatechange // attribute EventHandler  oniceconnectionstatechange;
 * @type function
 **/

//
// RTCIceConnectionState
//
// new           The ICE Agent is gathering addresses and/or waiting for remote candidates to be supplied.
// checking      The ICE Agent has received remote candidates on at least one component, and is checking candidate pairs but has not yet found a connection. In addition to checking, it may also still be gathering.
// connected     The ICE Agent has found a usable connection for all components but is still checking other candidate pairs to see if there is a better connection. It may also still be gathering.
// completed     The ICE Agent has finished gathering and checking and found a connection for all components. Open issue: it is not clear how the non controlling ICE side knows it is in the state.
// failed        The ICE Agent is finished checking all candidate pairs and failed to find a connection for at least one component. Connections may have been found for some components.
// disconnected  Liveness checks have failed for one or more components. This is more aggressive than failed, and may trigger intermittently (and resolve itself without action) on a flaky network.
// closed        The ICE Agent has shut down and is no longer responding to STUN requests.
//
// http://dev.w3.org/2011/webrtc/editor/webrtc.html#rtcpeerstate-enum
//
/**
 * @typedef { "new" | "checking" | "connected" | "completed" | "failed" | "disconnected" | "closed" } RTCIceConnectionState
 */
/**
 * @name RTCPeerConnection#iceConnectionState
 * @type RTCIceConnectionState
 **/

//
// RTCSignalingState
//
// stable                There is no offer­answer exchange in progress. This is also the initial state in which case the local and remote descriptions are empty.
// have-local-offer      A local description, of type "offer", has been successfully applied.
// have-remote-offer     A remote description, of type "offer", has been successfully applied.
// have-local-pranswer   A remote description of type "offer" has been successfully applied and a local description of type "pranswer" has been successfully applied.
// have-remote-pranswer  A local description of type "offer" has been successfully applied and a remote description of type "pranswer" has been successfully applied.
// closed                The connection is closed.
//
// http://dev.w3.org/2011/webrtc/editor/webrtc.html#rtcpeerstate-enum
//
/**
 * @typedef { "stable" | "have-local-offer" | "have-remote-offer" | "have-local-pranswer" | "have-remote-pranswer" | "closed" } RTCSignalingState
 */
/**
 * @name RTCPeerConnection#signalingState
 * @type RTCSignalingState
 **/

//
// RTCIceGatheringState
//
// new        The object was just created, and no networking has occurred yet.
// gathering  The ICE engine is in the process of gathering candidates for this RTCPeerConnection.
// complete   The ICE engine has completed gathering. Events such as adding a new interface or a new TURN server will cause the state to go back to gathering.
//
// http://dev.w3.org/2011/webrtc/editor/webrtc.html#rtcpeerstate-enum
//
/**
 * @typedef { "new" | "gathering" | "complete" } RTCIceGatheringState
 */
/**
 * @name RTCPeerConnection#iceGatheringState
 * @type RTCIceGatheringState
 **/


/**
 * @name RTCPeerConnection#ondatachannel
 * @type function
 * @see {@link http://www.w3.org/TR/webrtc/#widl-RTCPeerConnection-ondatachannel}
 **/

/**
 * dictionary RTCOfferOptions {
 *   long    offerToReceiveVideo;
 *   long    offerToReceiveAudio;
 *   boolean voiceActivityDetection = true;
 *   boolean iceRestart = false;
 * };
 *
 * @see {@link http://dev.w3.org/2011/webrtc/editor/webrtc.html#offer-answer-options}
 *
 * @name RTCOfferOptions
 * @typedef {{
 * @propety {boolean} OfferToReceiveVideo
 * @propety {boolean} OfferToReceiveAudio
 * @propety {boolean} [voiceActivityDetection]
 * @propety {boolean} [iceRestart]
 * @propety {boolean} [MozDontOfferDataChannel]
 *
 * //  [DtlsSrtpKeyAgreement]:    boolean,
 * //  [RtpDataChannels]:         boolean,
 */

/**
 * Answer/Offer Constraints
 * More info: http://dev.w3.org/2011/webrtc/editor/webrtc.html#idl-def-RTCOfferOptions
 *
 * @name RTCOfferConstraints
 * @property {RTCOfferOptions} mandatory
 * @property {RTCOfferOptions} [optional]
 */


/**
 * @class RTCDTMFSender
 *
 * @see {@link http://dev.w3.org/2011/webrtc/editor/webrtc.html#idl-def-RTCDTMFSender}
 */

/**
 * @name RTCDTMFToneChangeEvent
 * @type event
 * @memberOf RTCDTMFSender
 * @property {DOMString} tone
 *
 * @see {@link http://dev.w3.org/2011/webrtc/editor/webrtc.html#rtcdtmftonechangeevent}
 */

/**
 * @name RTCDTMFSender#ontonechange
 * @type function
 * @memberOf RTCDTMFSender
 * @param {RTCDTMFToneChangeEvent} tone
 */

/**
 * @name RTCDTMFSender#insertDTMF
 * @type function
 * @param {DOMString} tones        - The tones parameter is treated as a series of characters. The characters 0 through 9,
 *                                   A through D, #, and * generate the associated DTMF tones. The characters a to d are
 *                                   equivalent to A to D. The character ',' indicates a delay of 2 seconds before
 *                                   processing the next character in the tones parameter. All other characters must be
 *                                   considered unrecognized.
 * @param {long} [duration=100]    - The duration parameter indicates the duration in ms to use for each character passed
 *                                   in the tones parameters. The duration cannot be more than 6000 ms or less than 40 ms.
 *                                   The default duration is 100 ms for each tone.
 * @param {long} [interToneGap=70] - The interToneGap parameter indicates the gap between tones. It must be at least 30 ms.
 *                                   The default value is 70 ms. The browser may increase the duration and interToneGap
 *                                   times to cause the times that DTMF start and stop to align with the boundaries of RTP
 *                                   packets but it must not increase either of them by more than the duration of a single
 *                                   RTP audio packet.
 */

/**
 * @class MediaTrackConstraints
 *
 * @see {@link http://dev.w3.org/2011/webrtc/editor/getusermedia.html#media-track-constraints}
 */


/**
 * @class MediaStreamTrack
 *
 * @see {@link http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediastreamtrack}
 */
/**
 * @member MediaStreamTrack#kind
 * @type {DOMString}
 */
/**
 * @member MediaStreamTrack#id
 * @type {DOMString}
 */
/**
 * @member MediaStreamTrack#label
 * @type {DOMString}
 */
/**
 * @member MediaStreamTrack#enabled
 * @type {boolean}
 */
/**
 * @member MediaStreamTrack#muted
 * @type {boolean}
 */
/**
 * @event MediaStreamTrack#onmute
 * @type function
 */
/**
 * @event MediaStreamTrack#onunmute
 * @type function
 */
/**
 * @member MediaStreamTrack#_readonly
 * @type {boolean}
 */
/**
 * @member MediaStreamTrack#remote
 * @type {boolean}
 */
/**
 * @member MediaStreamTrack#readyState
 * @type {MediaStreamTrackState}
 */
/**
 * @event MediaStreamTrack#onended
 * @type function
 */
/**
 * @function MediaStreamTrack#clone
 * @param {MediaStreamTrack} track
 */
/**
 * @method MediaStreamTrack#stop
 */
/**
 * @function MediaStreamTrack#getCapabilities
 * @param {Capabilities} track
 */
/**
 * @function MediaStreamTrack#getConstraints
 * @param {MediaTrackConstraints} track
 */
/**
 * @function MediaStreamTrack#getSettings
 */
/**
 * @name MediaStreamError
 * @type {function}
 * @param {DOMString} name
 * @param {DOMString} message
 * @param {DOMString} constraintName
 * @see {@link http://dev.w3.org/2011/webrtc/editor/getusermedia.html#idl-def-MediaStreamError}
 */
/**
 * @name ConstraintErrorCallback
 * @type {function}
 * @param {MediaStreamError} error
 */
/**
 * @method MediaStreamTrack#applyConstraints
 * @param {MediaTrackConstraints} constraints
 * @param {VoidFunction} successCallback
 * @param {ConstraintErrorCallback} errorCallback
 */
/**
 * @event MediaStreamTrack#onoverconstrained
 * @type function
 */

/**
 * enum MediaStreamTrackState { "live", "ended" };
 *
 * @typedef {string} MediaStreamTrackState
 * @memberOf MediaStreamTrack
 */

/**
 * enum SourceTypeEnum { "camera", "microphone" };
 *
 * @typedef {string} SourceTypeEnum
 * @see {@link http://dev.w3.org/2011/webrtc/editor/getusermedia.html#track-source-types}
 *
 */

/**
 * @class MediaStreamConstraints
 *
 * @property {boolean|MediaTrackConstraints} video
 * @property {boolean|MediaTrackConstraints} audio
 *
 * @see {@link http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediastreamconstraints}
 */



/**
 * @class MediaStream
 * @see {@link http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediastream}
 */
/**
 * @member MediaStream#active
 * @type {boolean}
 */
/**
 * @member MediaStream#id
 * @type {DOMString}
 */
/**
 * @event MediaStream#onactive
 * @type function
 */
/**
 * @event MediaStream#onaddtrack
 * @type function
 */
/**
 * @event MediaStream#oninactive
 * @type function
 */
/**
 * @event MediaStream#onremovetrack
 * @type function
 */
/**
 * @method MediaStream#addTrack
 * @param {MediaStreamTrack} track
 */
/**
 * @function MediaStream#clone
 * @returns MediaStream
 */
/**
 * @name MediaStream#getAudioTracks
 * @type function
 * @returns MediaStreamTrack[]
 */
/**
 * @function MediaStream#getTrackById
 * @param {DOMString} trackId
 * @returns MediaStreamTrack|null
 */
/**
 * @function MediaStream#getTracks
 * @returns MediaStreamTrack[]
 */
/**
 * @function MediaStream#removeTrack
 * @param {MediaStreamTrack} track
 */
/**
 * @function MediaStream#stop
 */


