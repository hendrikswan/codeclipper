import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
const { createFFmpeg, fetchFile } = FFmpeg;

async function processVideo() {
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  const videoFile = document.getElementById("videoFile").files[0];
  const configFile = document.getElementById("configFile").files[0];

  if (!videoFile || !configFile) {
    alert("Please upload both video and configuration files.");
    return;
  }

  await ffmpeg.FS("writeFile", "input.mp4", await fetchFile(videoFile));
  const configText = await configFile.text();
  const config = JSON.parse(configText);

  let inputFileList = [];

  // Cut video based on clips defined in the JSON config
  for (const [index, clip] of config.clips.entries()) {
    const outputSegment = `output${index}.mp4`;
    inputFileList.push(outputSegment);
    await ffmpeg.run(
      "-i",
      "input.mp4",
      "-ss",
      String(clip.start),
      "-to",
      String(clip.end),
      "-c",
      "copy",
      outputSegment
    );
  }

  console.log("inputfile list ", inputFileList);

  console.log(ffmpeg.FS("readdir", "/")); // Logs all files in the current FS

  const fileListContent = inputFileList
    .map((file) => `file '${file}'`)
    .join("\n");
  await ffmpeg.FS("writeFile", "filelist.txt", fileListContent);

  // File concatenation
  await ffmpeg.run(
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    "filelist.txt",
    "-c",
    "copy",
    "output.mp4"
  );

  const data = ffmpeg.FS("readFile", "output.mp4");
  const video = document.getElementById("outputVideo");
  video.src = URL.createObjectURL(
    new Blob([data.buffer], { type: "video/mp4" })
  );

  // Cleanup
  ffmpeg.FS("unlink", "input.mp4");
  inputFileList.forEach((file) => ffmpeg.FS("unlink", file));
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <input type="file" id="videoFile" accept="video/*" />
      <input type="file" id="configFile" accept=".json" />
      <button onClick={processVideo}>Process Video</button>
      <video
        id="outputVideo"
        controls
        style={{ width: "100%", marginTop: "20px" }}
      ></video>
    </>
  );
}

export default App;
