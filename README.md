# Hibiki Scene Packs

Ready-to-import scene packs for [Hibiki](https://github.com/PhyberApex/hibiki), the Discord audio companion for tabletop sessions. Each pack is a `.hibiki.zip` with a complete scene (music, ambience, effects) **and the audio files bundled**, so it plays right after import. No hunting for sounds.

All bundled audio is public domain (CC0) except one door sound under CC BY 4.0, credited in every pack. See [CREDITS.md](CREDITS.md).

## Packs

| Pack | Mood | Download |
|---|---|---|
| **Cozy Tavern** | Fireplace, chatter, a bard in the corner. Downtime and social scenes. | [cozy-tavern.hibiki.zip](https://github.com/PhyberApex/hibiki-scene-packs/releases/latest/download/cozy-tavern.hibiki.zip) |
| **Deep Forest Trail** | Birdsong, a creek, exploration music. Wolves and owls for nightfall. | [forest-trail.hibiki.zip](https://github.com/PhyberApex/hibiki-scene-packs/releases/latest/download/forest-trail.hibiki.zip) |
| **Dungeon Crawl** | Low drone, dripping water, chains. Stone doors and distant blasts. | [dungeon-crawl.hibiki.zip](https://github.com/PhyberApex/hibiki-scene-packs/releases/latest/download/dungeon-crawl.hibiki.zip) |
| **Battlefield Clash** | Battle music plus a boss loop. Sword clashes, war horn, crossbow, charge. | [battlefield-clash.hibiki.zip](https://github.com/PhyberApex/hibiki-scene-packs/releases/latest/download/battlefield-clash.hibiki.zip) |
| **Stormy Night at the Inn** | Rain on the shutters, hearth fire, rolling thunder. Rest scenes. | [stormy-night-inn.hibiki.zip](https://github.com/PhyberApex/hibiki-scene-packs/releases/latest/download/stormy-night-inn.hibiki.zip) |
| **Haunted Crypt** | Dungeon synth, ghost whispers, funeral bells. A scream for the lid sliding off. | [haunted-crypt.hibiki.zip](https://github.com/PhyberApex/hibiki-scene-packs/releases/latest/download/haunted-crypt.hibiki.zip) |
| **High Seas Voyage** | Creaking hull, gulls, port-town and pirate themes. Cannon fire and ship's bell. | [high-seas-voyage.hibiki.zip](https://github.com/PhyberApex/hibiki-scene-packs/releases/latest/download/high-seas-voyage.hibiki.zip) |
| **Market Day** | Street market crowd, a smithy across the square, minstrel tune. Coins and bells. | [market-day.hibiki.zip](https://github.com/PhyberApex/hibiki-scene-packs/releases/latest/download/market-day.hibiki.zip) |

All packs for a version are attached to the matching [release](https://github.com/PhyberApex/hibiki-scene-packs/releases).

## Installing a pack

1. Download the `.hibiki.zip` you want.
2. In Hibiki, open the **Scenes** tab and click **Import**.
3. Pick the zip. The scene and its sounds land in your library, ready to play.

Importing the same sound twice (some packs share a track) simply overwrites the identical file, so your library stays tidy.

## What is inside a pack

```
cozy-tavern.hibiki.zip
├── hibiki-scene.json      # scene manifest (tracks, volumes, loop flags, source links)
├── CREDITS.txt            # every track with author, source URL and license
└── sounds/
    ├── music/…
    ├── ambience/…
    └── effects/…
```

The same scenes are also listed in Hibiki's [community registry](https://github.com/PhyberApex/hibiki/tree/main/registry) as reference-only entries. The registry links to the sounds; these packs bundle them.

## Audio quality and licensing

- Freesound tracks are the site's public HQ MP3 previews (128 kbps), which is above what Discord voice delivers. OpenGameArt tracks are the originals or the site's OGG transcodes.
- A few long recordings used as one-shot effects (sword clash, thunder strike, coins, bells) are trimmed with a short fade so they fire cleanly.
- Every track's license is listed in [CREDITS.md](CREDITS.md) and in the `CREDITS.txt` inside each pack. Scene definitions themselves are CC0.

## Building the packs yourself

Requires Node 20+, `curl` and `ffmpeg`.

```bash
npm install
npm run build        # downloads audio into dl/, writes zips to out/, regenerates CREDITS.md
```

Scene definitions live in [`scenes/`](scenes/) and mirror the registry entries. Edit one, rebuild, and the matching zip is regenerated.

## Contributing a pack

Open a PR adding a scene JSON to `scenes/` that follows the [registry schema](https://github.com/PhyberApex/hibiki/blob/main/registry/schema/scene-entry.schema.json). Every track needs a `source` with a URL to a CC0 or CC BY file on Freesound or OpenGameArt, and the license spelled out in the `note`. The builder must be able to fetch it (Freesound preview or a direct OpenGameArt file).
