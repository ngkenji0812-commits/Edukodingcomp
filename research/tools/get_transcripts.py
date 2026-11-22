"""Download transcripts for every video in ../videos.json so you can study them.

Run this on your OWN computer (YouTube blocks cloud servers):
    pip install youtube-transcript-api
    python get_transcripts.py
Transcripts are saved to ../transcripts/<topic>/<video_id>.txt
"""
import json, pathlib, re
from youtube_transcript_api import YouTubeTranscriptApi

here = pathlib.Path(__file__).resolve().parent
videos = json.loads((here.parent / "videos.json").read_text())
api = YouTubeTranscriptApi()
for topic, rows in videos.items():
    folder = here.parent / "transcripts" / re.sub(r"[^a-z0-9]+", "-", topic.lower()).strip("-")
    folder.mkdir(parents=True, exist_ok=True)
    for r in rows:
        dest = folder / f"{r['id']}.txt"
        if dest.exists():
            continue
        try:
            text = " ".join(s.text for s in api.fetch(r["id"], languages=["en", "en-US", "en-GB"]))
            dest.write_text(f"{r['title']}\n{r['channel']}\n\n{text}\n", encoding="utf-8")
            print("ok  ", r["title"])
        except Exception as e:
            print("skip", r["title"], "-", type(e).__name__)
