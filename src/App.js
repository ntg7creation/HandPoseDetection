import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import ThreeFBXScene from "./ThreeFBXScene";

import { drawPose } from "./drawPose"; // Add this at the top

import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [deviceId, setDeviceId] = useState(null);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [DrawingUtilsClass, setDrawingUtilsClass] = useState(null);
  const [PoseConnections, setPoseConnections] = useState(null);
  const [poseLandmarks, setPoseLandmarks] = useState(null);

  const videoWidth = 640;
  const videoHeight = 480;

  // Load MediaPipe PoseLandmarker
  useEffect(() => {
    const loadModel = async () => {
      const mp = await import(
        "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0"
      );
      const { DrawingUtils, FilesetResolver, PoseLandmarker } = mp;

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      setPoseLandmarker(landmarker);
      setDrawingUtilsClass(() => DrawingUtils);
      setPoseConnections(PoseLandmarker.POSE_CONNECTIONS);
    };

    loadModel();
  }, []);

  // Select preferred camera
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      const filtered = videoDevices.filter(
        (d) => !/virtual|redmi/i.test(d.label)
      );
      const preferred = filtered[0] || videoDevices[0];
      if (preferred) setDeviceId(preferred.deviceId);
    });
  }, []);

  // Prediction loop
  useEffect(() => {
    let animationFrameId;

    const predict = async () => {
      if (
        poseLandmarker &&
        DrawingUtilsClass &&
        PoseConnections &&
        webcamRef.current &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const now = performance.now();

        poseLandmarker.detectForVideo(video, now, (result) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setPoseLandmarks(result.landmarks[0]); // store landmarks for 1st pose

          drawPose(ctx, result.landmarks, DrawingUtilsClass, PoseConnections);
        });
      }

      animationFrameId = requestAnimationFrame(predict);
    };

    if (poseLandmarker && DrawingUtilsClass && PoseConnections) {
      predict();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [poseLandmarker, DrawingUtilsClass, PoseConnections]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="video-container">
          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={{
              deviceId: deviceId ? { exact: deviceId } : undefined,
            }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        </div>

        <div className="three-container">
          <ThreeFBXScene landmarks={poseLandmarks} />
        </div>
      </header>
    </div>
  );
}

export default App;
