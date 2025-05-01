// 1. Install dependencies DONE
// 2. Import dependencies DONE
// 3. Setup webcam and canvas DONE
// 4. Define references to those DONE
// 5. Load handpose DONE
// 6. Detect function DONE
// 7. Drawing utilities DONE
// 8. Draw functions DONE

import React, { useEffect, useRef, useState } from "react";
// import logo from './logo.svg';
import * as handpose from "@tensorflow-models/handpose";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      console.log("Available video devices:", videoDevices);

      // Filter out virtual cameras or specific unwanted labels
      const filtered = videoDevices.filter(
        (d) => !/virtual|redmi/i.test(d.label)
      );
      const preferred = filtered[0] || videoDevices[0]; // fallback
      if (preferred) {
        console.log("Selected camera:", preferred.label);
        setDeviceId(preferred.deviceId);
      } else {
        console.warn("No suitable camera found.");
      }
    });
  }, []);

  const runHandpose = async () => {
    const net = await handpose.load();
    // console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);
      // console.log(hand);

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      // if (hand.length > 0) console.log(ctx);
      drawHand(hand, ctx);
    }
  };

  runHandpose();

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={{
            deviceId: deviceId ? { exact: deviceId } : undefined,
          }}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9, // this was zindex should be zIndex worked 2 hours to find this
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
