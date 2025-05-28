import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { FBXLoader, OrbitControls } from "three-stdlib";

const width = 1280;
const height = 960;

const ThreeFBXScene = ({ landmarks }) => {
  const canvasRef = useRef();
  const humanoidRef = useRef(null);
  const modelRef = useRef(null); // Save reference to the loaded model object
  const skinnedMeshRef = useRef(null);
  const latestLandmarksRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x222244);

    const camera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
    camera.position.z = 5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

    const loader = new FBXLoader();
    loader.load(
      process.env.PUBLIC_URL + "/X_Bot.fbx",
      (object) => {
        object.scale.set(0.01, 0.01, 0.01);
        scene.add(object);
        modelRef.current = object; // Save the entire model

        // Stop animation playback
        if (object.animations?.length) {
          const mixer = new THREE.AnimationMixer(object);
          mixer.stopAllAction();
        }

        const bones = {};
        object.traverse((child) => {
          if (child.isBone) {
            bones[child.name] = child;
            console.log("Bone:", child.name);
            const helper = new THREE.AxesHelper(5);
            // child.rotation.y = 1.3;
            child.add(helper);
          }
          if (child.isSkinnedMesh) {
            if (child.name === "Beta_Surface") {
              skinnedMeshRef.current = child;
            } else if (child.name === "Beta_Joints") {
              child.visible = false;
            }
          }
        });

        humanoidRef.current = bones;
      },
      undefined,
      (error) => {
        console.error("FBX load error:", error);
      }
    );
    const animate = () => {
      requestAnimationFrame(animate);

      const model = modelRef.current;
      const lm = latestLandmarksRef.current;

      if (model && lm) {
        const rShoulder = lm[12];
        const rElbow = lm[14];
        const rWrist = lm[16];

        const lShoulder = lm[11];
        const lElbow = lm[13];
        const lWrist = lm[15];

        // if (rShoulder && rElbow) {
        //   const dx = rElbow.x - rShoulder.x;
        //   const dy = rElbow.y - rShoulder.y;
        //   const angleX = Math.atan2(dy, dx);
        //   const angleY = Math.atan2(dx, dy);

        //   const bone = model.getObjectByName("mixamorigRightArm");
        //   if (bone) {
        //     bone.rotation.x = Math.PI - angleX;
        //     bone.rotation.y = Math.PI - angleY;
        //   }
        // }

        if (rElbow && rWrist) {
          const dx = rWrist.x - rElbow.x;
          const dy = rWrist.y - rElbow.y;
          const angleX = Math.atan2(dy, dx);
          const angleY = Math.atan2(dx, dy);

          const bone = model.getObjectByName("mixamorigRightForeArm");
          if (bone) {
            bone.rotation.x = Math.PI - angleX;
            bone.rotation.y = Math.PI - angleY;
          }
        }

        // if (lShoulder && lElbow) {
        //   const dx = lElbow.x - lShoulder.x;
        //   const dy = lElbow.y - lShoulder.y;
        //   const angleX = Math.atan2(dy, dx);
        //   const angleY = Math.atan2(dx, dy);

        //   const bone = model.getObjectByName("mixamorigLeftArm");
        //   if (bone) {
        //     bone.rotation.x = Math.PI - angleX;
        //     bone.rotation.y = Math.PI - angleY;
        //   }
        // }

        // if (lElbow && lWrist) {
        //   const dx = lWrist.x - lElbow.x;
        //   const dy = lWrist.y - lElbow.y;
        //   const angleX = Math.atan2(dy, dx);
        //   const angleY = Math.atan2(dx, dy);

        //   const bone = model.getObjectByName("mixamorigLeftForeArm");
        //   if (bone) {
        //     bone.rotation.x = Math.PI - angleX;
        //     bone.rotation.y = Math.PI - angleY;
        //   }
        // }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();
  }, []);

  useEffect(() => {
    latestLandmarksRef.current = landmarks;
  }, [landmarks]);

  return <canvas ref={canvasRef} />;
};

export default ThreeFBXScene;
