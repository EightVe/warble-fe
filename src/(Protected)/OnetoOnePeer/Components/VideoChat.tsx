import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:3000");

const VideoChat: React.FC = () => {
  const [matched, setMatched] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const partnerVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
      });

    // Handle match event
    socket.on("match", (partnerId: string) => {
      setMatched(partnerId);

      // Initialize WebRTC peer
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream!,
      });

      peer.on("signal", (signal) => {
        socket.emit("signal", partnerId, signal);
      });

      peer.on("stream", (partnerStream) => {
        if (partnerVideoRef.current) {
          partnerVideoRef.current.srcObject = partnerStream;
        }
      });

      peerRef.current = peer;
    });

    // Handle incoming signals
    socket.on("signal", (senderId: string, signal: Peer.SignalData) => {
      if (!peerRef.current) {
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream!,
        });

        peer.on("signal", (signal) => {
          socket.emit("signal", senderId, signal);
        });

        peer.on("stream", (partnerStream) => {
          if (partnerVideoRef.current) {
            partnerVideoRef.current.srcObject = partnerStream;
          }
        });

        peer.signal(signal);
        peerRef.current = peer;
      }
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startMatching = () => {
    socket.emit("startMatching");
  };

  return (
    <div>
      <h1>Video Chat App</h1>
      {!matched ? (
        <button onClick={startMatching}>Start Matching</button>
      ) : (
        <p>Matched with: {matched}</p>
      )}
      <div>
        <video ref={userVideoRef} autoPlay muted />
        <video ref={partnerVideoRef} autoPlay />
      </div>
    </div>
  );
};

export default VideoChat;