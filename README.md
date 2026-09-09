# PIKOK

AI pipeline that generates audio devotional from open heavens and then disburses it through telegram

## Operation Steps

> Scrape open heavens from dedicated website

> Parse it with open sourced LLM to get script

> Parse script into Data JSON Engine

> Perform TTS

> Download suitable audio for In and Outro

> Merge audio based on Data JSON Engine into the Devotional Template

> Disburse audio at required times

## Operation tools

- Groq for tts and Inference
- Render for Server Hosting
- Cloudinary for file hosting

I am about to get into the audio pairing and arrangement. afterwards, Ill work on the DLS
