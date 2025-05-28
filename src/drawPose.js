// drawPose.js

export function drawPose(
  ctx,
  landmarksList,
  DrawingUtilsClass,
  PoseConnections
) {
  if (!ctx || !landmarksList || landmarksList.length === 0) return;

  const drawingUtils = new DrawingUtilsClass(ctx);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (const landmarks of landmarksList) {
    drawingUtils.drawLandmarks(landmarks, {
      color: "#FF6F00",
      radius: (data) => DrawingUtilsClass.lerp(data.from.z, -0.15, 0.1, 6, 2),
    });

    drawingUtils.drawConnectors(landmarks, PoseConnections, {
      color: "#00FFAA",
      lineWidth: 2,
    });
  }
}
