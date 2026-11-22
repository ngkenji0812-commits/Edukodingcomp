"""Find the most-viewed YouTube videos for a topic (uses yt-dlp search metadata only).

Usage:  pip install yt-dlp
        python find_videos.py "roblox player retention" 20
"""
import json, subprocess, sys

query = sys.argv[1]
top = int(sys.argv[2]) if len(sys.argv) > 2 else 20
out = subprocess.run(["yt-dlp", "--flat-playlist", "-j", f"ytsearch60:{query}"],
                     capture_output=True, text=True).stdout
rows = [json.loads(l) for l in out.splitlines() if l.strip()]
rows = [r for r in rows if (r.get("duration") or 0) >= 150]          # skip Shorts
rows.sort(key=lambda r: -(r.get("view_count") or 0))
for r in rows[:top]:
    print(f"{r.get('view_count') or 0:>11,}  {r['id']}  {r.get('channel')} | {r.get('title')}")
