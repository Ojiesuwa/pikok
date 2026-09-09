import audio from "audio";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firstAudio = path.join(__dirname, "audio", "tts (2).wav");
const secondAudio = path.join(__dirname, "audio", "tts (4).wav");

const outputDir = path.join(__dirname, "output");
const outputFile = path.join(outputDir, "merged.wav");

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const first = audio(firstAudio);
  const second = audio(secondAudio);

  const firstData = await first;
  const secondData = await second;

  console.log("First duration:", firstData.duration);
  console.log("Second duration:", secondData.duration);

  const secondStart = firstData.duration - 0.5;

  const outputDuration = secondStart + secondData.duration;
  const padding = outputDuration - firstData.duration;

  console.log("Second starts:", secondStart);
  console.log("Expected output duration:", outputDuration);
  console.log("Padding:", padding);

  const extendedFirst = first.pad(0, padding);

  console.log("Extended first duration:", extendedFirst.duration);

  const merged = extendedFirst.mix(second, {
    at: secondStart,
  });

  console.log("Merged duration:", merged.duration);

  await merged.save(outputFile);

  console.log("Saved:", outputFile);
}
main().catch(console.error);
