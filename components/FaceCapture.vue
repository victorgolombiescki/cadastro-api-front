<template>
  <div>
    <video ref="video" autoplay playsinline width="720" height="560"></video>
    <button @click="startVideo">Start Video</button>
    <button @click="recognizeFace">Reconhecer</button>
    <button @click="registerFace">Cadastrar</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as faceapi from "face-api.js";

const video = ref(null);
const modelsLoaded = ref(false);

const loadModels = async () => {
  const modelPath = "/models";
  console.log("Loading models from:", modelPath);
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
  ]);
  modelsLoaded.value = true;
  console.log("Models loaded");
};

const startVideo = () => {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.value.srcObject = stream;
      console.log("Video stream started");
    })
    .catch((err) => {
      console.error("Error accessing camera: ", err);
    });
};

const recognizeFace = async () => {
  if (!modelsLoaded.value) {
    console.log("Models not loaded yet");
    return;
  }

  if (video.value && !video.value.paused && !video.value.ended) {
    const detections = await faceapi
      .detectAllFaces(video.value, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    if (detections.length > 0) {
      const descriptor = Array.from(detections[0].descriptor); // Convert descriptor to array
      console.log("Face detected, sending descriptor:", descriptor);
      try {
        const { data, error } = await useFetch(
          "http://localhost:3001/face-recognition/verify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ descriptor }),
          }
        );
        if (error.value) {
          console.error("Network response was not ok:", error.value);
          return;
        }
        console.log("Backend response:", data.value);
        alert(`Access Granted: ${data.value.accessGranted}`);
      } catch (error) {
        console.error("Error verifying access:", error);
      }
    } else {
      console.log("No face detected");
    }
  } else {
    console.log("Video not playing");
  }
};

const registerFace = async () => {
  if (!modelsLoaded.value) {
    console.log("Models not loaded yet");
    return;
  }

  if (video.value && !video.value.paused && !video.value.ended) {
    const detections = await faceapi
      .detectAllFaces(video.value, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    if (detections.length > 0) {
      const descriptor = Array.from(detections[0].descriptor); // Convert descriptor to array
      console.log(
        "Face detected, sending descriptor for registration:",
        descriptor
      );
      try {
        const { data, error } = await useFetch(
          "http://localhost:3001/face-recognition/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ descriptor, name: "User Name" }), // Inclua o nome do usuário ou outros detalhes conforme necessário
          }
        );
        if (error.value) {
          console.error("Network response was not ok:", error.value);
          return;
        }
        console.log("Backend response:", data.value);
        alert(`Registration Successful: ${data.value.message}`);
      } catch (error) {
        console.error("Error registering face:", error);
      }
    } else {
      console.log("No face detected");
    }
  } else {
    console.log("Video not playing");
  }
};

onMounted(() => {
  loadModels().then(() => {
    console.log("Models loaded, starting video");
    startVideo();
  });
});
</script>

<style scoped>
video {
  border: 1px solid #ccc;
  display: block;
  margin: 0 auto;
}
</style>
