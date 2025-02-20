import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const PeerSystem = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [partnerConnected, setPartnerConnected] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    socket.on("peerOffer", async (offer) => {
      peerConnection.current = new RTCPeerConnection();
      peerConnection.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));
      localVideoRef.current.srcObject = stream;
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("peerAnswer", answer);
      setPartnerConnected(true);
    });

    socket.on("peerAnswer", async (answer) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      setPartnerConnected(true);
    });

    socket.on("peerUsers", (users) => {
      if (users < 2) {
        setIsMatching(false);
        setPartnerConnected(false);
      }
    });

    return () => {
      socket.off("peerOffer");
      socket.off("peerAnswer");
      socket.off("peerUsers");
    };
  }, []);

  const startMatching = async () => {
    setIsMatching(true);
    peerConnection.current = new RTCPeerConnection();
    peerConnection.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));
    localVideoRef.current.srcObject = stream;
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("peerOffer", offer);
  };

  const nextChat = () => {
    if (peerConnection.current) peerConnection.current.close();
    setIsMatching(false);
    setPartnerConnected(false);
    startMatching();
  };

  return (
    <div>
      {!isMatching ? (
        <button onClick={startMatching}>Start Matching</button>
      ) : (
        <div>
          <video ref={localVideoRef} autoPlay playsInline muted></video>
          <video ref={remoteVideoRef} autoPlay playsInline></video>
          {partnerConnected ? (
            <button onClick={nextChat}>Next Video Chat</button>
          ) : (
            <p>Searching for a partner...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PeerSystem;
