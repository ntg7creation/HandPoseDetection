import { drawPose } from "./draw";

export async function loadPoseLandmarker() {
  const mp = await import(
    "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0"
  );
  const vision = await mp.FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );

  return {
    poseLandmarker: await mp.PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
    }),
    DrawingUtils: mp.DrawingUtils,
  };
}

export function detectPoses(
  poseLandmarker,
  webcamRef,
  canvasRef,
  DrawingUtilsClass
) {
  if (!poseLandmarker || !webcamRef.current || !canvasRef.current) return;

  const video = webcamRef.current.video;
  if (video.readyState !== 4) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const now = performance.now();
  poseLandmarker.detectForVideo(video, now, (result) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPose(ctx, result.landmarks, DrawingUtilsClass);
  });
}
