# Roblox Game Design Research → EduQuest

Research on how to make a successful Roblox game, applied to **EduQuest**, the learning-adventure game idea on this website.

Topics, in order: Roblox development & game design → player retention → gameplay loops → UI design → monetization → what makes a game fun → the best techniques → how to apply them to EduQuest.

---

## 0. How this research was done (and what limited it)

| Step | What happened |
|---|---|
| Find GitHub tools for studying YouTube | Searched GitHub by stars (section 1). |
| Pick the top 20 videos per topic | Ran several YouTube searches per topic with **yt-dlp**, removed Shorts and off-topic gameplay clips, then ranked by view count. That gives 120 real videos (section 2, plus `videos.json`). |
| Read the videos | **Blocked.** YouTube shows cloud servers a "Sign in to confirm you're not a bot" wall, so no transcripts could be downloaded here. Amara (a public subtitle site) also refused. I did not try to get around YouTube's bot check. |
| What I studied instead | (a) Roblox's **official Creator Docs** on core loops, onboarding, onboarding techniques, quests, UI/UX, retention, engagement, monetization, contextual purchases, economies, LiveOps and "Design for Roblox", read in full. (b) Written summaries of key videos and talks found by web search. (c) Research on learning games and on fun (Habgood's *Zombie Division* study, MDA, Flow, Self-Determination Theory). (d) My existing knowledge of the well-known videos on the list (Game Maker's Toolkit, Extra Credits, Design Doc and others). |

**Be honest about this when you use it.** Section 3 is a summary of what these *sources* teach. It is not a line-by-line transcript summary of each of the 120 videos. To study the actual videos, run `tools/get_transcripts.py` on your own computer. It saves every transcript into `research/transcripts/`, and you (or Claude) can then check the findings against them.

---

## 1. Best GitHub repos for studying YouTube videos

Ranked by GitHub stars (checked 22 Nov 2026).

| Repo | Stars | What it does | Best for |
|---|---:|---|---|
| [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp) | ~210k | Searches YouTube, downloads metadata, subtitles, audio | **Finding videos** and ranking them by views (used here) |
| [jdepoix/youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) | ~8.6k | Python library: gets a video's transcript, no API key | **Reading videos as text** (`tools/get_transcripts.py` uses it) |
| [nexmoe/VidBee](https://github.com/nexmoe/VidBee) | ~11k | Download + local transcription + AI summary app | Videos with no captions |
| [wendy7756/AI-Video-Transcriber](https://github.com/wendy7756/AI-Video-Transcriber) | ~3.4k | Transcribe and summarize videos with AI | Summaries |
| [jimmc414/onefilellm](https://github.com/jimmc414/onefilellm) | ~2.0k | Puts YouTube transcripts, repos and papers into one text file for an AI | Feeding many videos to Claude at once |
| [zarazhangrui/youtube-digest](https://github.com/zarazhangrui/youtube-digest) | ~1.8k | Turns videos into study notes, with bilingual translation | Studying in English + Indonesian |
| [Dicklesworthstone/bulk_transcribe_youtube_videos_from_playlist](https://github.com/Dicklesworthstone/bulk_transcribe_youtube_videos_from_playlist) | ~0.7k | Transcribes a whole playlist with Whisper | A whole playlist at once |

**Recommended combo:** `yt-dlp` to find and rank videos → `youtube-transcript-api` to get the text → give the transcripts to Claude to pull out techniques. Both scripts are in `research/tools/`.

---

## 2. The top 20 videos per topic (120 videos)

Ranked by YouTube views at the time of search. Sources are a mix of Roblox creators (Duckable, AlvinBlox, SmartyRBX, Tizzy RBLX, waveshine, BrawlDev, Kek...), Roblox itself (RDC talks, Roblox Creators), and general game-design channels (Game Maker's Toolkit, Extra Credits, Design Doc, Indie Game Clinic).

### 1. Roblox development & game design

| # | Video | Channel | Views | Length |
|---|---|---|---:|---:|
| 1 | [Making a Roblox Game Was a Mistake...](https://www.youtube.com/watch?v=hUk567j6CLo) | edmondx | 7,650,451 | 14:44 |
| 2 | [How to make your FIRST Roblox Game (Make Robux)](https://www.youtube.com/watch?v=-QSmtYVMRH4) | CodeBro29 | 2,864,763 | 29:49 |
| 3 | [The 100 Games That Taught Me Game Design](https://www.youtube.com/watch?v=gWNXGfXOrro) | Game Maker's Toolkit | 2,565,577 | 133:14 |
| 4 | [Everything You Need To Start Making Games (As A Beginner)](https://www.youtube.com/watch?v=_eK26atXTds) | Juniper Dev | 2,533,740 | 16:11 |
| 5 | [My Viral Roblox Game DIED… So I Made a Better One](https://www.youtube.com/watch?v=eRhFPgj8tc4) | Duckable | 1,254,254 | 26:21 |
| 6 | [How To Think Like A Game Designer](https://www.youtube.com/watch?v=iIOIT3dCy5w) | Game Maker's Toolkit | 996,538 | 13:07 |
| 7 | [I Spent 2,000 DAYS to Make a VIRAL Roblox Game](https://www.youtube.com/watch?v=52srr65Mksc) | Duckable | 956,861 | 26:39 |
| 8 | [DON'T Make a Roblox Game Without Watching This First.](https://www.youtube.com/watch?v=vemqKJ-5yRE) | SmartyRBX | 869,768 | 27:20 |
| 9 | [I Made a VIRAL Roblox Game Without AI](https://www.youtube.com/watch?v=Cc7HT3uNjeQ) | Duckable | 628,607 | 22:47 |
| 10 | [Watch this before making ROBLOX Games](https://www.youtube.com/watch?v=xnlaYLnCtFc) | waveshine | 574,780 | 10:03 |
| 11 | [How To Make A Popular Roblox Game](https://www.youtube.com/watch?v=Le4QhC3dDGk) | AlvinBlox | 518,347 | 11:16 |
| 12 | [20 Game Dev Tips I Wish I Was Told Earlier](https://www.youtube.com/watch?v=fqb9MfRqK9I) | Gambit | 496,668 | 8:40 |
| 13 | [I Made a Successful Roblox Game to Prove It’s Not Luck](https://www.youtube.com/watch?v=RIWPfMJyVhQ) | Zyonic | 428,148 | 8:01 |
| 14 | [10 Stages of Roblox Game Development](https://www.youtube.com/watch?v=ASr_I6inrzI) | Zilar | 423,949 | 6:13 |
| 15 | [10 Game Design Lessons from 10 Years of GMTK](https://www.youtube.com/watch?v=Cm2_drGLGbc) | Game Maker's Toolkit | 420,925 | 15:38 |
| 16 | [5 Principles of Game Design](https://www.youtube.com/watch?v=pF2LGYVRCwI) | Field of View: The Art of Game Design | 186,156 | 39:47 |
| 17 | [Avoid These 5 Roblox Dev Mistakes (They Cost Me Thousands)](https://www.youtube.com/watch?v=f63stwpsaXw) | AlvinBlox | 184,206 | 8:32 |
| 18 | [How I Made a Viral Roblox Game](https://www.youtube.com/watch?v=fjlOaEALWmg) | janisjanis01 | 143,351 | 12:54 |
| 19 | [I Made 3 Viral Roblox Games in a Row (Here's What I Wish I Knew Sooner)](https://www.youtube.com/watch?v=_JyiKfNNqls) | Tizzy RBLX | 87,243 | 24:54 |
| 20 | [Roblox Game Design Explained Like You're 5 Yrs Old](https://www.youtube.com/watch?v=CRCcsYEB_6A) | Tizzy RBLX | 72,684 | 17:31 |

### 2. Player retention

| # | Video | Channel | Views | Length |
|---|---|---|---:|---:|
| 1 | [How to Keep Players Engaged (Without Being Evil)](https://www.youtube.com/watch?v=hbzGO_Qonu0) | Game Maker's Toolkit | 2,789,325 | 10:46 |
| 2 | [The Manipulative Design of Roblox](https://www.youtube.com/watch?v=cGAXGroHZKA) | yakkocmn | 1,128,859 | 24:18 |
| 3 | [What Makes a Good Level Up System?](https://www.youtube.com/watch?v=Ae_zvm0-CQU) | Design Doc | 581,148 | 17:56 |
| 4 | [What Makes A Game Replayable?](https://www.youtube.com/watch?v=AX_59mS8mr0) | Design Doc | 517,442 | 20:20 |
| 5 | [Here's Why Roblox Games Blow Up](https://www.youtube.com/watch?v=Y93DRfB-Deo) | AlvinBlox | 294,436 | 11:01 |
| 6 | [The DO's and DON'Ts of Growing a Game... (Roblox)](https://www.youtube.com/watch?v=rdWyuDEpGyk) | SmartyRBX | 273,455 | 3:26 |
| 7 | [How to ACTUALLY get Players in your ROBLOX Game](https://www.youtube.com/watch?v=3BHo5a_OF5U) | waveshine | 254,062 | 5:23 |
| 8 | [How My 100 Player AI Roblox Game Made 2,000,000 Robux (NO BULLSH*T)](https://www.youtube.com/watch?v=KoGT6LokHBE) | Tap | 216,109 | 24:06 |
| 9 | [Before You Make Your Roblox Game, Study THIS First](https://www.youtube.com/watch?v=N2FND74tgGE) | SmartyRBX | 98,227 | 5:57 |
| 10 | [How To EASILY Get Roblox's 500 Highly Engaged Players](https://www.youtube.com/watch?v=Oo3sCq-TQXs) | VuukStudios | 48,984 | 14:47 |
| 11 | [How to Improve Your Roblox Game Stats FAST](https://www.youtube.com/watch?v=HFcegpPPvpI) | Tizzy RBLX | 38,755 | 16:48 |
| 12 | [What are retention metrics on Roblox?](https://www.youtube.com/watch?v=LpAU6TheAZ4) | Roblox Creators | 35,925 | 2:54 |
| 13 | [How To Grow A Small Roblox Game.](https://www.youtube.com/watch?v=fPT2GCkK1QM) | rasdev | 32,058 | 4:52 |
| 14 | [Why 90% of Roblox Games Never Get Players](https://www.youtube.com/watch?v=xIBc5He_sy4) | MoseyTube77 | 23,377 | 8:02 |
| 15 | [How to Boost your Game using Roblox Funnel Analytics](https://www.youtube.com/watch?v=u_8p65Bsm2Y) | GnomeCode | 20,510 | 7:56 |
| 16 | [How I Got 250 Highly Engaged Players on Roblox (Step-by-Step)](https://www.youtube.com/watch?v=byM3x2HaAe4) | DevHex | 17,578 | 6:18 |
| 17 | [The Retention Playbook: Turning Players into Fans / RDC 2025](https://www.youtube.com/watch?v=YgyfcMfxQcI) | Roblox | 7,688 | 37:00 |
| 18 | [The BEST Tutorial System on ROBLOX](https://www.youtube.com/watch?v=S6suI7d4B7s) | qweekertom | 7,630 | 11:51 |
| 19 | [Space Ape Live Ops Boot Camp Part 1: Designing Live Ops Systems in Free to Play Gacha Economies](https://www.youtube.com/watch?v=zywAS1NB9V4) | Space Ape Games | 5,967 | 29:18 |
| 20 | [Successful Roblox GAME DEV Tutorial #1: RETENTION!](https://www.youtube.com/watch?v=xNG0UNbRpgA) | TehLemonsRUs | 3,621 | 12:39 |

### 3. Gameplay loops

| # | Video | Channel | Views | Length |
|---|---|---|---:|---:|
| 1 | [How Video Game Economies are Designed](https://www.youtube.com/watch?v=Zrf1cou_yVo) | Game Maker's Toolkit | 1,280,241 | 16:12 |
| 2 | [How Games Use Feedback Loops](https://www.youtube.com/watch?v=H4kbJObhcHw) | Game Maker's Toolkit | 1,183,288 | 13:11 |
| 3 | [My Roblox Game Makes $119,300/mo (38K CCU, here's how)](https://www.youtube.com/watch?v=LZOohZHsJus) | Tizzy RBLX | 391,589 | 23:03 |
| 4 | [How Cyberpunk 2077 built the PERFECT gameplay loop](https://www.youtube.com/watch?v=un7_ljz4LJM) | WireMagician | 383,391 | 8:47 |
| 5 | [How Gameplay Loops Keep You Playing](https://www.youtube.com/watch?v=Sk-nbAtIUko) | Adam Millard - The Architect of Games | 317,496 | 14:16 |
| 6 | [The Real Core Loop - What Every Game Has In Common - Extra Credits](https://www.youtube.com/watch?v=mGL5YGcAxEI) | Extra Credits | 189,256 | 9:07 |
| 7 | [Gameplay Loops Are Out, Chains Are In](https://www.youtube.com/watch?v=6SYX17NzNqE) | Indie Game Clinic | 160,654 | 11:02 |
| 8 | [Game Mechanics & Systems Thinking](https://www.youtube.com/watch?v=nkLmjJK3vOw) | Indie Game Clinic | 143,086 | 40:49 |
| 9 | [How Dave the Diver’s Addictive Gameplay Loop Captured Millions of Gamers](https://www.youtube.com/watch?v=xznspQkSD6c) | IGN | 117,992 | 8:49 |
| 10 | [What are loops in game design? - Loops - Game Design Theory](https://www.youtube.com/watch?v=PMj8Q4ViKzs) | Game Design with Michael | 107,473 | 9:44 |
| 11 | [Core Game Loops](https://www.youtube.com/watch?v=aDE69s3pp7M) | Timothy Cain | 88,237 | 13:28 |
| 12 | [Core loops - Simple Game Design](https://www.youtube.com/watch?v=B2Ut-LH8ai8) | Matthew Palaje | 79,544 | 5:59 |
| 13 | [How (and Why) to Design for "Repetition With Variety"](https://www.youtube.com/watch?v=Jqh7SVpMR1o) | Indie Game Clinic | 70,439 | 31:57 |
| 14 | [How To Design a Gameplay Loop](https://www.youtube.com/watch?v=wTbSrOexWZU) | Apox Fox | 57,806 | 7:35 |
| 15 | [Deltarune Has An AMAZING Gameplay Loop](https://www.youtube.com/watch?v=9ElMi1EdXU0) | NoodleGirl | 56,486 | 10:43 |
| 16 | [Go from Ideas to Gameplay using Gameplay Loops](https://www.youtube.com/watch?v=MIMMJ4xHYR8) | Game Design with Michael | 36,638 | 5:32 |
| 17 | [Here's What Makes Incremental Games FUN!](https://www.youtube.com/watch?v=hty_r4LIRb0) | Developing Ideal Idle Incremental Game | 28,265 | 10:33 |
| 18 | [The Core Loop of Helldivers 2 Keeps You Playing](https://www.youtube.com/watch?v=sTa7GatZC98) | Andrew Chambers | 14,123 | 21:55 |
| 19 | [The Power of The Gameplay Loop](https://www.youtube.com/watch?v=zg7FVwCboEo) | Christian Wan | 10,408 | 10:54 |
| 20 | [Core Loop Essentials](https://www.youtube.com/watch?v=bROouMt1b3g) | Roblox Creators | 5,336 | 7:16 |

### 4. UI design

| # | Video | Channel | Views | Length |
|---|---|---|---:|---:|
| 1 | [world's shortest UI/UX design course](https://www.youtube.com/watch?v=wIuVvCuiJhU) | Juxtopposed | 2,207,819 | 6:53 |
| 2 | [How To Make GUI / Roblox Studio](https://www.youtube.com/watch?v=L8Fg1pxPrzY) | Kingkade 3D | 698,899 | 10:35 |
| 3 | [Essential UI Tips & Tricks / Roblox Studio](https://www.youtube.com/watch?v=9kuWl_t1AOE) | Stewiepfing | 321,232 | 9:19 |
| 4 | [Best UI Plugins To Use In Roblox Studio](https://www.youtube.com/watch?v=UN6aLrhZlK0) | gfxcomet | 209,202 | 7:11 |
| 5 | [How to SCALE GUI like a PRO / Buttons + Frames + ScrollingFrames / Roblox Studio](https://www.youtube.com/watch?v=BLZl-0cl2DM) | Itz_FloppyFish | 195,145 | 40:16 |
| 6 | [This New UI is Insane](https://www.youtube.com/watch?v=_q4fcM1eWvg) | DeHapy | 187,871 | 8:52 |
| 7 | [How Modern Roblox UI Actually Works](https://www.youtube.com/watch?v=Ezk3vEOvv8o) | Leif | 185,929 | 14:56 |
| 8 | [Making Good UI is EASY, People Are Just Lazy](https://www.youtube.com/watch?v=ZTzUHfMeYKA) | ByteBlox | 177,468 | 17:29 |
| 9 | [How to style your UI on Roblox](https://www.youtube.com/watch?v=_k1ea0OIKaU) | Roblox Creators | 177,309 | 8:35 |
| 10 | [Make Your Roblox UI Look 10x Better](https://www.youtube.com/watch?v=F6AtQKo3uIY) | Develuper | 173,282 | 7:03 |
| 11 | [How to create Roblox Guis using Figma!](https://www.youtube.com/watch?v=_UfFmap5cow) | MonzterDEV | 160,859 | 22:08 |
| 12 | [The Ultimate Beginner’s Guide to Roblox GUI](https://www.youtube.com/watch?v=lmNWskz9cEI) | Kek | 152,001 | 18:16 |
| 13 | [How To Add Effects To UI In Roblox Studio](https://www.youtube.com/watch?v=p_T0V9Lg2Ns) | gfxcomet | 139,979 | 11:27 |
| 14 | [Make Your Roblox UI Buttons SUPER Smooth in 8 Minutes!](https://www.youtube.com/watch?v=2z4rebjBnQA) | PineappleDev | 138,420 | 8:35 |
| 15 | [The Greatest Cartoony UI Tutorial on Roblox (w/ Figma)](https://www.youtube.com/watch?v=z16zs2v-FNI) | Kek | 99,063 | 41:54 |
| 16 | [Make Your UI Feel 10x Times Better With ANIMATIONS](https://www.youtube.com/watch?v=8pJGBz-J75w) | Develuper | 58,027 | 6:59 |
| 17 | [How To Improve Your UI In Roblox Studio](https://www.youtube.com/watch?v=RPqIm0I_gsw) | Kingkade 3D | 47,831 | 11:44 |
| 18 | [How To Scale UI Across Devices In Roblox Studio](https://www.youtube.com/watch?v=1B46XsUvi2E) | Kingkade 3D | 39,475 | 4:36 |
| 19 | [Ranking Your Roblox UI Designs! Rookie or Grandmaster?](https://www.youtube.com/watch?v=zqNxVsTYCJ0) | gfxcomet | 30,301 | 6:17 |
| 20 | [My top 8 ADVANCED UI design tips](https://www.youtube.com/watch?v=-2vzMH8iqsg) | Learn UI Design | 10,924 | 18:13 |

### 5. Monetization

| # | Video | Channel | Views | Length |
|---|---|---|---:|---:|
| 1 | [How I Made $14M Robux in 1 WEEK](https://www.youtube.com/watch?v=K-4fRBnN2Ek) | Laughability | 6,678,148 | 51:51 |
| 2 | [I Spent 24 Hours With Roblox Millionaires](https://www.youtube.com/watch?v=8xgnm6SynH4) | Starter Story | 4,411,338 | 20:31 |
| 3 | [I Tested Every Way of Making Robux on Roblox](https://www.youtube.com/watch?v=dw-ptAfExYw) | gubs | 4,154,314 | 14:41 |
| 4 | [Here's how I made 2.3M Robux in 3 days of work](https://www.youtube.com/watch?v=zW0VdnOqxMk) | waveshine | 1,511,447 | 4:01 |
| 5 | [You NEED These Roblox Gamepasses..](https://www.youtube.com/watch?v=eDQsGe0GgZs) | BulletWarning | 1,061,843 | 13:51 |
| 6 | [How I Made $10M Robux in 30 Days](https://www.youtube.com/watch?v=xqHXDYbuF2w) | janisjanis01 | 959,530 | 10:45 |
| 7 | [The Gross Monetization of Roblox's Tower Defense Games (Gambling, Pay-to-Win)](https://www.youtube.com/watch?v=H9MoA94zKdc) | CORSO | 306,710 | 8:04 |
| 8 | [Gamepasses (One-Time Robux Pass & DataStore Receipt) - Roblox Advanced Scripting #21 (2024)](https://www.youtube.com/watch?v=nh7MYYL5CGE) | BrawlDev | 76,773 | 35:28 |
| 9 | [Developer Products (Repeated Robux Pass) - Roblox Advanced Scripting #22](https://www.youtube.com/watch?v=n29WMYNTZHs) | BrawlDev | 64,671 | 30:52 |
| 10 | [My Roblox Game Makes $12,535/mo (3K CCU, Here's How)](https://www.youtube.com/watch?v=a170E9klbP4) | MoseyTube77 | 49,984 | 5:29 |
| 11 | [Top 5 Ways to MONETIZE Your Roblox Game!](https://www.youtube.com/watch?v=5uXLixtTgJM) | RoBuilder | 44,464 | 8:36 |
| 12 | [My Roblox Game Made $43,292 (Here's Exactly How to Monetize Yours)](https://www.youtube.com/watch?v=-PoyiiGhoNo) | MoseyTube77 | 35,589 | 6:05 |
| 13 | [Roblox Game Monetization Explained Like You're 5](https://www.youtube.com/watch?v=zoz3PSMqets) | Tizzy RBLX | 32,979 | 15:08 |
| 14 | [Exploiters Can HACK Your Dev Products AND Gamepasses.. / Roblox Studio](https://www.youtube.com/watch?v=xaBW50Xz7Vs) | Stewiepfing | 27,947 | 7:57 |
| 15 | [Monetize your Roblox game / Donation Board](https://www.youtube.com/watch?v=uA2hcnFITR4) | Don Planck | 24,536 | 4:19 |
| 16 | [Ranking Video Game Monetization Strategies](https://www.youtube.com/watch?v=0_L8MnBl7g0) | P-Bean | 15,556 | 8:54 |
| 17 | [Mastering Monetization: Lessons from Top Creators / RDC 2026](https://www.youtube.com/watch?v=hoMbv_R8AMU) | Roblox | 8,520 | 30:23 |
| 18 | [Mastering Monetization: Turning Creativity into Revenue / RDC 2025](https://www.youtube.com/watch?v=MJ-zYfL10Ew) | Roblox | 5,845 | 34:27 |
| 19 | [the roblox monetization tierlist nobody is honest about](https://www.youtube.com/watch?v=x_SflcuSi1w) | Alex Builds Games | 4,634 | 15:43 |
| 20 | [Monetizing a Roblox Experience with Erythia, MrFergie & Shawnyg](https://www.youtube.com/watch?v=YdplC2WVkWc) | Roblox Creators | 3,729 | 66:24 |

### 6. What makes a game fun

| # | Video | Channel | Views | Length |
|---|---|---|---:|---:|
| 1 | [What is Roblox? Why do people play it?](https://www.youtube.com/watch?v=YU2pLJiptzA) | I Am Your Target Demographic | 1,883,682 | 4:23 |
| 2 | [I’m Sick of SLOP… So I Made My DREAM Game](https://www.youtube.com/watch?v=3XX3Y74hzq0) | Duckable | 1,881,125 | 24:39 |
| 3 | [The Games That Designed Themselves](https://www.youtube.com/watch?v=kMDe7_YwVKI) | Game Maker's Toolkit | 1,329,458 | 12:15 |
| 4 | [Secrets of Game Feel and Juice](https://www.youtube.com/watch?v=216_5nu4aVQ) | Game Maker's Toolkit | 1,127,125 | 5:19 |
| 5 | [Can We Make This Button Fun To Press?](https://www.youtube.com/watch?v=7L1B5YaxxoA) | Jonas Tyroller | 964,639 | 7:37 |
| 6 | [Why Roblox Games Became Slop (From a Roblox Dev)](https://www.youtube.com/watch?v=w84RkabVjeg) | AwesomeDev | 957,028 | 8:06 |
| 7 | [What Makes A Good Difficulty Option?](https://www.youtube.com/watch?v=Gpfgh02qJ4I) | Design Doc | 617,035 | 26:32 |
| 8 | [why 22 million people are addicted to this 'boring' roblox game](https://www.youtube.com/watch?v=5WQHP7BnQ9M) | blabverse | 569,497 | 11:35 |
| 9 | [Exploration in Games - Four Ways Players Discover Joy - Extra Credits](https://www.youtube.com/watch?v=FE7lDFAcb4Y) | Extra Credits | 543,000 | 6:38 |
| 10 | [WIRED by Design: A Game Designer Explains the Counterintuitive Secret to Fun](https://www.youtube.com/watch?v=78rPt0RsosQ) | WIRED | 356,575 | 10:43 |
| 11 | [What Makes Games FUN (Psychology in Gaming)](https://www.youtube.com/watch?v=lkatr_a1OMQ) | My GameDev Pal | 270,906 | 7:01 |
| 12 | [The Trick To Instantly Make Your Game FUN](https://www.youtube.com/watch?v=U0a-IE5xawo) | Thomas Brush | 145,954 | 26:07 |
| 13 | [What Makes a Game Cozy? ~ Design Doc](https://www.youtube.com/watch?v=g4yT-uAUcSA) | Design Doc | 131,904 | 11:03 |
| 14 | [How do Game Designers make their games FUN?](https://www.youtube.com/watch?v=7oBHqVQ-JLA) | Sasquatch B Studios | 93,293 | 7:27 |
| 15 | [The Secret To Making Your Roblox Game FUN! (Game Design)](https://www.youtube.com/watch?v=gc7K98RlOik) | SmartyRBX | 59,368 | 2:50 |
| 16 | [What is Fun? A Game Design Introduction](https://www.youtube.com/watch?v=56ENqlUST9U) | Indie Game Clinic | 55,032 | 31:11 |
| 17 | [How to make an ADDICTIVE game?](https://www.youtube.com/watch?v=ItcH5s14q7A) | VAV | 49,258 | 8:36 |
| 18 | [What is FLOW THEORY in game design? - The Basics - (Part 1)](https://www.youtube.com/watch?v=3H8pQyyXxHg) | Game Design with Michael | 40,573 | 8:42 |
| 19 | [5 Types of Core Mechanics That Make Games FUN!](https://www.youtube.com/watch?v=jNIhY5u4dUE) | NOBL Games | 10,642 | 11:17 |
| 20 | [Roblox Player Psychology EXPOSED: Maslow’s Hierarchy of Needs](https://www.youtube.com/watch?v=zXzXOw5605E) | SmartyRBX | 4,480 | 13:41 |

---

## 3. What the research teaches, topic by topic

### 3.1 Roblox development & game design

1. **Make it fun first, pretty later.** Roblox's own guide says younger players "are often less sensitive to visual fidelity and more likely to stick around if they're having a good time." Prototype with plain parts and Toolbox assets, playtest, then polish.
2. **Small scope, finish, ship, repeat.** The "I made a game in 24 hours / 7 days / 30 days" videos (Duckable, janisjanis01, TEG, Tizzy) all follow the same pattern. They build a small idea fast, publish, read the stats, and then improve or start over. "My Viral Roblox Game DIED… So I Made a Better One" is that loop in action.
3. **Success is a process, not luck.** "Prove It's Not Luck" (Zyonic) and "Here's Why Roblox Games Blow Up" (AlvinBlox) both point to the same things: a clear hook, a good thumbnail and icon, strong first-session stats, and then ads or recommendations that boost a game whose stats are already good.
4. **Design for Roblox's audience** (official doc "Design for Roblox"):
   - Most players are on **mobile**. Design UI for phones first.
   - Players hop between games with friends. **Social games retain better**, and single-player games "find it harder to build and retain an audience."
   - **Tourists vs. locals.** Tourists try many games, and locals stay. Most locals start out as tourists, so the first 5 minutes decide everything.
   - Top kids' games copy **childhood play**: Brookhaven is like playing house, Islands is like Lego, Jailbreak is cops and robbers.
   - Follow **genre conventions** so you have less to explain.
   - Think about **YouTubers**. Could a streamer make a fun video in your game? Add a "Creator Cam" that hides the UI.
5. **Think like a designer** (GMTK): define the experience you want first, then pick mechanics that create it. Playtest constantly and watch what players do, not what they say.

### 3.2 Player retention

Official Roblox guidance on which stat to fix, and how:

| Stat | Usually low because... | Fix |
|---|---|---|
| **D1** (come back next day) | Weak onboarding / FTUE | Short, visual tutorial. Get to the fun in under a minute. A "joyful moment" after the first loop. Show the progress ahead. |
| **D7** | Weak progression | Clear short, mid and long-term goals. Content variety. Tune the difficulty (too fast runs out of content, too slow gets boring). |
| **D30** | No end-game | Updates: small ones every **2–4 weeks**, big ones every **2–3 months**. Social systems: trading, parties, guilds, PvP, leaderboards. |

Other key points:
- **Measure the funnel.** List every onboarding step and log how many players finish it (Funnel Analytics, GnomeCode / Roblox docs). Fix the step with the biggest drop. Roblox's analytics also show how many new players are **still playing after 5 minutes**.
- **Onboarding techniques** (official doc):
  - **Visual elements:** bouncing arrows, glowing trails, a highlighted button with the rest of the screen dimmed, in-world signs.
  - **Contextual tutorials:** teach a feature the first time a player meets it, not up front.
  - **Timed hints:** if most players press a button within 10 seconds, highlight it at 11 seconds, only once and only for players who are stuck.
- **Keep players engaged *without being evil*** (GMTK, 2.8M views). Use **novelty** (keep adding new ways to play), **mystery and anticipation** (tease what's coming), **mastery** (test skill in new situations), and a difficulty curve that keeps players in **flow**. Avoid compulsion tricks.
- **Warning: "The Manipulative Design of Roblox" (1.1M views)** and academic studies found that many Roblox games use deceptive patterns: fake timers, pressure to buy, confusing currencies. The FTC raised similar concerns in 2026. A game for kids should not do this, and Roblox's rules forbid false urgency.

### 3.3 Gameplay loops

- **Roblox's 3-part core loop** (official): 1) **minute-to-minute action** (for example, explore), 2) **most repeated action**, the game's defining mechanic (for example, fight), 3) **progression engine** (for example, upgrade), which makes the next loop better. "Without a progression system, a game becomes repetitive, boring, and shallow."
- **Every game's loop is anticipation → challenge → reward** (Extra Credits, "The Real Core Loop"). Players expect a reward, face a challenge, and get the payoff.
- **Feedback loops** (GMTK, 1.2M). Positive loops (winners get stronger) speed a game up, and negative loops (catch-up help) keep it close. In team games, use catch-up help so losing players don't quit.
- **Loops inside loops.** A 30-second loop (answer, attack, reward) sits inside a 5-minute loop (finish a quest), inside a session loop (unlock a zone), inside a weekly loop (event or season).
- **Repetition with variety** (Indie Game Clinic). Repeat the same core action, but change the context, enemies, rules or modifiers so it never feels identical.
- **Economy** (GMTK "How Video Game Economies are Designed" + Roblox "Balance virtual economies"). Every currency needs **sources** (ways to earn) and **sinks** (ways to spend). Calculate the expected value of rewards. Give events their own event currency so the main economy stays balanced.
- Successful Roblox loops (Tizzy RBLX's $119k/month game, simulators, "+1 every second" games) are simple and readable in seconds, with a number that keeps going up.

### 3.4 UI design

Official Roblox UI/UX principles:
- **Prioritize.** What is the player doing right now, and what do they need to see for it? Show only that.
- **Attention tools:** color (bright = important), size, empty space, grouping, and movement (wiggle the button you want pressed).
- **Conventions:** an X closes a window, gray means unusable, a lock icon means not unlocked yet, inventory slots go along the bottom, and "E"/tap prompts for interaction.
- **Consistency:** one color per stat everywhere, close buttons always in the same place, prices in red when you can't afford them.
- **Feedback for every action:** the button changes on press, a sound plays on purchase, a progress bar fills.
- **Mobile first.** Keep the bottom-left and bottom-right clear for Roblox's touch controls. Test with the Device Emulator. Scale UI with Scale (not Offset) plus UIAspectRatioConstraint (Kingkade 3D, Itz_FloppyFish).
- **Visual > text.** Many young players are "reading-averse", so use icons. Visual UI is also easier to translate.

From the Roblox UI creators (Leif, ByteBlox, Develuper, PineappleDev, Kek, gfxcomet):
- Pick one clear style (cartoony, stud or clean), plan it first in Figma, and keep it consistent.
- Use UICorner, UIStroke, UIGradient and UIPadding. Animate buttons with TweenService (grow a little on hover, shrink on press) and open windows with a pop.
- Don't block the screen with big menus. Keep the HUD small and open menus only when asked.

### 3.5 Monetization

- **Tools:** game passes (one-time purchase), developer products (repeatable, like boosts or currency), subscriptions, private servers, and Creator Rewards (paid for engagement, which replaced Premium Payouts). Price optimization and regional pricing can tune prices.
- **What sells** (Roblox docs "Monetization foundations"): **expression** items (skins, pets, emotes, trails) and **enhancement** items (boosts, tools, extra slots). Make the shop **integrated, contextual and inviting**.
- **Contextual purchases:** offer an item when it makes sense, for example in a pre-game lobby or as a matching bonus, never in the middle of the action.
- **Season passes:** a free track plus a premium track, attractive rewards, and a timeframe you can actually finish. Missions are tied to the core loop.
- **Lessons from successful devs** (Laughability, janisjanis01, waveshine, Tizzy, MoseyTube77): money follows retention. Make the game fun and sticky first, then add a small set of clear passes (2x coins, VIP, extra slots, a cosmetic pack) and one repeatable product.
- **Security** (Stewiepfing): always grant purchases on the **server** using `ProcessReceipt`, and never trust the client.
- **Ethics** (CORSO's "Gross Monetization of Roblox Tower Defense Games", "Manipulative Design of Roblox", Roblox policy):
  - No fake urgency.
  - No pay-to-win against other players.
  - Paid random items (loot boxes) must follow PolicyService rules, so avoid them in a kids' learning game.
  - Don't make private servers expensive, because that blocks friends from playing together.

### 3.6 What makes a game fun

- **Learning is the fun** (Raph Koster, echoed by GMTK). Players have fun while they're mastering something new, and boredom comes once there's nothing left to learn. **That's good news for an educational game.**
- **Flow:** clear goals, instant feedback, and a challenge that matches skill and grows with it.
- **Self-Determination Theory:** players need to feel **competence** (I'm getting better), **autonomy** (I choose) and **relatedness** (I'm with friends).
- **MDA's "kinds of fun":** sensation, fantasy, narrative, challenge, fellowship, discovery, expression, submission (relaxing). Pick 2–3 to turn up.
- **Game feel and "juice"** (GMTK, 1.1M; Jonas Tyroller's "Can We Make This Button Fun To Press?", 960k): small effects make simple actions feel great. Examples are screen shake, particles, sound, squash-and-stretch, numbers flying out, and a pause on impact.
- **Exploration and discovery** (Extra Credits): hidden areas, secrets and curiosity.
- **Roblox's "slop" debate** (Duckable's "Sick of SLOP" at 1.9M, AwesomeDev at 960k): players are tired of copy-paste cash grabs. An original idea with care put into it stands out.
- **Learning games specifically.** Habgood's *Zombie Division* study (children aged 7–11) found that when the **math is the game mechanic** (you attack a zombie by dividing its number), kids **learned more and chose to play 7× longer** than when the math was a quiz between game parts. *A quiz with a gold star is not a game.*

---

## 4. The best techniques (ranked by impact for EduQuest)

1. **Make the learning *be* the mechanic** (intrinsic integration), not a quiz popup. This is the single most important finding for an educational game.
2. **Get to the fun in under 60 seconds.** Use a visual tutorial (arrows, trails, a dimmed screen with a highlight), contextual tutorials, and timed hints only for stuck players.
3. **A clear 3-part core loop** (action → main mechanic → progression), with anticipation → challenge → reward inside it.
4. **Short, mid and long-term goals that are always visible**: dailies, quest chains, badges, a world map with locked zones.
5. **Flow-tuned difficulty.** Adapt question difficulty to each player. Make early levels fast and later levels gradually harder.
6. **Social play**: co-op quests, teamwork gates, parties and friend invites. This is Roblox's biggest retention engine.
7. **Juice and moments of joy**: celebrate every correct answer and every level-up.
8. **Mobile-first, visual, consistent UI**: big buttons, icons over text, bilingual (EN/ID).
9. **Measure and iterate**: funnel events for each tutorial step, then watch D1, D7, D30 and session length. Update every 2–4 weeks.
10. **Fair, kid-safe monetization**: cosmetics and convenience only, never paywalled learning, no fake urgency, no loot boxes.
11. **Novelty and mystery**: a new zone, enemy type or rule every few minutes, and tease the next locked area.
12. **Make it streamer-friendly**: funny moments, co-op chaos, and a Creator Cam.

---

## 5. Applying it to EduQuest

### 5.1 The pitch (one sentence)
> **EduQuest: team up with friends, explore a magic island, and defeat monsters by using English words, math, and logic as your spells.**

It is a co-op adventure, not a quiz game. Like playing "wizards" (Roblox's own advice: tap into childhood play), with a number-and-word spell system.

### 5.2 Core loop (Roblox's 3-part model)

```
 EXPLORE (minute-to-minute)        →  CAST / SOLVE (main mechanic)          →  UPGRADE (progression)
 run around zones, find chests,       monsters carry a math number or a         earn XP + Crystals → new spells,
 talk to NPCs, discover secrets       word-picture; you "cast" by choosing      wand skins, pets, unlock next zone
                                      the right answer → spell hits
              ↑______________________________________________________________________|
```

**Intrinsic integration examples (learning = the attack):**
- **Math Tower zone:** a slime shows `12`. Your spells are `÷2`, `÷3`, `÷4`. Pick the one that splits it into exactly the number of slimes you can handle (like Zombie Division). Correct = satisfying split. Wrong = the slime bounces off and you try again, with no punishment screen.
- **Word Portal zone:** a bridge is broken, and floating word blocks (`LEARN`, `PLAY`, `SLEEP`) drift past. Jump onto the block that matches the picture or the Indonesian word ("belajar") to rebuild the bridge. It's an obby and a vocabulary game at the same time.
- **Logic Lab:** push-block puzzles where you build a sequence (if/then gates). This is early coding logic.
- **Teamwork Gate:** a door needs 2–4 players standing on plates that together make a target number (for example, 3 + 5 + 2 = 10). You *have* to talk, so it teaches teamwork through the mechanic itself.

### 5.3 First 5 minutes (FTUE), step by step and tracked

| Time | What happens | Technique |
|---|---|---|
| 0:00 | Spawn on a beach. A glowing trail leads to a wand on a rock. No text wall. | Visual elements, get to the fun |
| 0:15 | Pick up the wand. A slime with `2` appears. A big button shows `÷2`, and the rest of the screen dims. | Highlight + dim |
| 0:25 | Tap it, and the slime splits with a POP, coins fly out, and a sound plays. | Juice + moment of joy |
| 0:40 | Three more slimes with different numbers. Hint arrow only if stuck for 10 seconds. | Timed hints |
| 1:30 | Level 2 reached (very low XP threshold). A new spell unlocks. | Fast early progression |
| 2:30 | The first Word Portal bridge, taught *only when you reach it*. | Contextual tutorial |
| 4:00 | Mini-boss "Number Golem" with confetti, a badge and a chest. | End FTUE with joy |
| 4:30 | A map opens showing locked zones (Math Tower, Logic Lab, Sky Library) with "?" mysteries. | Leave them wanting more, mystery |

Log a **funnel event** at each row (Roblox `AnalyticsService:LogOnboardingFunnelStepEvent`). The step with the biggest drop gets fixed first.

### 5.4 Progression and goals
- **Short** (one session): **3 daily quests** (for example, "Defeat 10 slimes with division", "Rebuild 2 bridges", "Help a friend at a Teamwork Gate"). Rewards are small Crystals.
- **Mid** (days): zone quest chains that end in a boss, plus a **Spell Book** collection (each new word or math skill learned becomes a collectible card with a picture, in EN and ID).
- **Long** (weeks): open all zones, max out the Spell Book, and earn the badges. Optional seasonal events (an "English Week" festival with its own event currency and shop).
- **Adaptive difficulty:** each skill (division, multiplication, vocabulary topic) has a hidden level per player. Move up after about 3 correct answers in a row, and down after 2 misses, to keep each player in flow. Give 2nd graders and 6th graders a different experience in the same world.
- **No shame for mistakes:** a wrong answer gives a funny bounce plus a hint, never a "FAILED" screen. Mistakes are part of learning (matching your own message: "error bukan akhir").

### 5.5 Social (biggest retention lever on Roblox)
- Co-op quests for 2–4 players, Teamwork Gates, and a shared boss HP bar.
- A "Help a friend" bonus: answering a question for a stuck teammate gives both of you Crystals. Good behavior is rewarded.
- Friend invites ("bring a friend = both get a pet egg"), free private servers for classes and friend groups (teacher-friendly), and a server leaderboard for **helping**, not only for score.

### 5.6 UI plan
- **HUD:** top-left XP bar + level, top-right Crystals, bottom-center 3–4 big spell buttons (thumb-sized). Keep the bottom-left and bottom-right clear for Roblox's touch controls.
- One cartoony style (rounded corners, thick outlines, bright colors). Fixed colors: **Math = blue, English = green, Logic = purple, Teamwork = orange**. Use these everywhere, including icons, gates and cards.
- Icons over text, every button animated (tween grow and shrink), and sounds on every action.
- **EN/ID language toggle** (you already built this on the website). Use Roblox LocalizationService plus auto-translate.
- A Creator Cam button that hides the HUD for YouTubers.

### 5.7 Fun and juice checklist
- [ ] Correct answer: particles, a sound, a number pop-up, a tiny screen shake.
- [ ] Level up: a full-screen burst, a chime, and the new spell shown big.
- [ ] Every 3–5 minutes something new happens: a new monster type, rule twist, secret, or chest.
- [ ] Secrets: hidden word-treasure chests and an "Easter egg" badge.
- [ ] Self-expression: wand skins, robes, pets, trails.

### 5.8 Monetization (fair and kid-safe)
| Type | Item | Why it's fair |
|---|---|---|
| Game pass | **Cosmetic packs** (wand skins, robes, trails) | Expression only |
| Game pass | **VIP** (golden name tag, VIP lounge, +1 daily quest slot) | Convenience, no learning blocked |
| Game pass | **Pet Companion** (follows you and cheers on correct answers) | Cute expression |
| Dev product | **Crystal packs** for cosmetics only | Repeatable, optional |
| Season pass | Free track + premium track (cosmetics), 6–8 weeks, missions tied to learning quests | Achievable timeframe |
| Creator Rewards | Earned automatically from players' engaged playtime | Rewards good retention |

**Rules:** all learning content stays **free**. No pay-to-win, no loot boxes, no fake countdowns. Purchases are granted server-side with `ProcessReceipt`. Private servers are free or cheap for classes.

### 5.9 Build roadmap

| Phase | Goal | Done when... |
|---|---|---|
| 1. Prototype (1–2 weeks) | One zone (Math Tower), the division spell, 3 monster types, plain parts | Friends play it 10 minutes and want more |
| 2. FTUE + juice (2 weeks) | The full 5-minute onboarding from 5.3, effects, sounds, funnel events | 70%+ of testers reach the Number Golem |
| 3. Loop + progression (2–3 weeks) | XP, spells, dailies, Spell Book, Word Portal zone | Testers play 2+ days in a row |
| 4. Social (2 weeks) | Teamwork Gates, co-op boss, invites | Groups talk and help each other |
| 5. UI polish + EN/ID | Mobile-first HUD, localization | Works well on a phone |
| 6. Launch + measure | Publish, small ads budget, watch D1/D7/session time | D1 improving launch over launch (rough community target: 20%+), then fix the weakest step |
| 7. Live updates | New zone or event every 2–4 weeks, monetization from 5.8 | D30 grows |

### 5.10 Numbers to watch
- **Funnel:** % of players finishing each FTUE step. Fix the biggest drop first.
- **D1 / D7 / D30 retention** and **average session time** (Roblox Analytics → Retention / Engagement).
- **Learning:** accuracy per skill over time. Are players getting better? That's your "impact" proof for the website.
- **Social:** % of sessions with 2+ friends, number of Teamwork Gates solved.

---

## Sources

**Roblox official Creator Docs** (read in full):
[Core loops](https://create.roblox.com/docs/production/game-design/core-loops) ·
[Onboarding](https://create.roblox.com/docs/production/game-design/onboarding) ·
[Onboarding techniques](https://create.roblox.com/docs/production/game-design/onboarding-techniques) ·
[Introduction to quest design](https://create.roblox.com/docs/production/game-design/introduction-to-quest-design) ·
[Design for Roblox](https://create.roblox.com/docs/production/game-design/design-for-roblox) ·
[UI and UX design](https://create.roblox.com/docs/production/game-design/ui-ux-design) ·
[Retention](https://create.roblox.com/docs/production/analytics/retention) ·
[Engagement](https://create.roblox.com/docs/production/analytics/engagement) ·
[Monetization](https://create.roblox.com/docs/production/monetization) ·
[Passes](https://create.roblox.com/docs/production/monetization/passes) ·
[Developer products](https://create.roblox.com/docs/production/monetization/developer-products) ·
[Monetization foundations](https://create.roblox.com/docs/production/game-design/monetization-foundations) ·
[Contextual purchases](https://create.roblox.com/docs/production/game-design/contextual-purchases) ·
[Balance virtual economies](https://create.roblox.com/docs/production/game-design/balance-virtual-economies) ·
[Subscription design](https://create.roblox.com/docs/production/game-design/subscription-design) ·
[LiveOps essentials](https://create.roblox.com/docs/production/game-design/liveops-essentials) ·
[Design educational games](https://create.roblox.com/docs/education/developer/designing-educational-experiences) ·
[Adaptive design](https://create.roblox.com/docs/production/publishing/adaptive-design)

**Research & other:**
[Habgood & Ainsworth, intrinsic integration / Zombie Division](https://shura.shu.ac.uk/3556) ·
[Habgood PhD thesis](https://eprints.nottingham.ac.uk/10385/1/Habgood_2007_Final.pdf) ·
[Self-Determination Theory & games review](https://arxiv.org/html/2405.12639v1) ·
[Kinds of Fun (MDA)](https://computerscience.chemeketa.edu/cis125greader/Players/KindsOfFun.html) ·
[Deceptive design in a popular Roblox game (UCLan)](https://clok.uclan.ac.uk/49285/1/3611053.pdf) ·
[Monetization in Roblox worlds (Eiger et al.)](https://yaeleiger.github.io/assets/papers/Roblox-conpro.pdf) ·
[RDC 2025 Retention Playbook listing](https://videos.tidyhosts.com/the-retention-playbook-turning-players-into-fans-rdc-2025) ·
[GMTK "Keep Players Engaged" (Amara subtitles page)](https://amara.org/v/C3BEf) ·
[DevForum: Improving onboarding through funnel events](https://devforum.roblox.com/t/improving-onboarding-through-funnel-events/3064458)
