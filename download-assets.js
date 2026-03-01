#!/usr/bin/env node
/**
 * download-assets.js
 * ──────────────────────────────────────────────────────────────────────────
 * Downloads all Habitat Cafe Unsplash images to /public/assets/images/
 * and writes a mapping.json for Task 2 (codebase reference update).
 *
 * Run:  node download-assets.js
 * Requires Node 18+ (built-in fetch) — no npm install needed.
 * ──────────────────────────────────────────────────────────────────────────
 */

import { createWriteStream, mkdirSync, writeFileSync } from 'fs'
import { pipeline } from 'stream/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, 'public', 'assets', 'images')
mkdirSync(OUTPUT_DIR, { recursive: true })

/* ─── Image manifest ────────────────────────────────────────────────────── */
const IMAGES = [
    // ── THE MORNING RITUAL (MENU_CATEGORIES + TAB) ──────────────────────
    {
        name: 'pehelwan-paratha',
        photoId: 'photo-1565557623262-b51c2513a641',
        // Indian flatbread / paratha on ceramic plate, warm light
    },
    {
        name: 'anda-ghotala-pav',
        photoId: 'photo-1525351484163-7529414344d8',
        // Spiced egg scramble with bread, natural light
    },
    {
        name: 'morning-nashta',
        photoId: 'photo-1567337710282-00832b415979',
        // Desi breakfast spread
    },
    {
        name: 'morning-chai',
        photoId: 'photo-1544787219-7f47ccb76574',
        // Chai in ceramic cup, steam
    },

    // ── EARTH & GRAIN (MENU_CATEGORIES + TAB) ────────────────────────────
    {
        name: 'pachimirchi-kodi',
        photoId: 'photo-1598515214211-89d3c73ae83b',
        // Chicken dish, earthy ceramic, green chilies
    },
    {
        name: 'cheese-balls',
        photoId: 'photo-1541592106381-b31e9677c0e5',
        // Golden fried cheese balls, wooden board
    },
    {
        name: 'grain-bowl',
        photoId: 'photo-1512621776951-a57141f2eefd',
        // Heirloom grain / salad bowl, vibrant
    },
    {
        name: 'sharing-bites',
        photoId: 'photo-1476224203421-9ac39bcb3327',
        // Overhead shared-table spread, colorful small plates
    },

    // ── THE MAIN EVENT (MENU_CATEGORIES + TAB) ───────────────────────────
    {
        name: 'railway-mutton-curry',
        photoId: 'photo-1545247181-516773cae754',
        // Dark curry in deep bowl, moody earthy light
    },
    {
        name: 'bolognese-pasta',
        photoId: 'photo-1555949258-eb67b1ef0ceb',
        // Pasta bolognese macro, dark meat sauce, parsley
    },
    {
        name: 'big-plates',
        photoId: 'photo-1540189549336-e6e99c3679fe',
        // Plated mains, restaurant context
    },
    {
        name: 'chefs-special',
        photoId: 'photo-1455619452474-d2be8b1e70cd',
        // Chef's special presentation
    },

    // ── BOTANICAL BREWS (MENU_CATEGORIES + TAB) ──────────────────────────
    {
        name: 'matcha-rose-latte',
        photoId: 'photo-1515823064-d6e0c04616a7',
        // Matcha latte art in white ceramic, minimal
    },
    {
        name: 'caribbean-cold-brew',
        photoId: 'photo-1582476836296-3c6ebf6d1785',
        // Tall glass, ice cubes, dark cold brew, condensation
    },
    {
        name: 'pour-over-coffee',
        photoId: 'photo-1495474472287-4d71bcdd2085',
        // Pour-over coffee ceremony, warm light
    },
    {
        name: 'iced-latte',
        photoId: 'photo-1461023058943-07fcbe16d735',
        // Iced latte in clear glass, natural light
    },

    // ── ALSO USED IN PINNED MENU (bolognese category fallback) ──────────
    {
        name: 'pasta-hero',
        photoId: 'photo-1551183053-bf91798d792a',
        // Pasta hero shot (used in MENU_CATEGORIES mains pin)
    },
]

/* ─── Download logic ────────────────────────────────────────────────────── */
const BASE = 'https://images.unsplash.com'
// Use w=1200 for local copies — better quality than the w=600 src params
// Next.js Image will then serve the right size via responsive optimization
const PARAMS = 'w=1200&auto=format&fit=crop&q=85'

const mapping = {}

async function download({ name, photoId }) {
    const url = `${BASE}/${photoId}?${PARAMS}`
    const filename = `${name}.jpg`
    const filePath = path.join(OUTPUT_DIR, filename)
    const localPath = `/assets/images/${filename}`

    process.stdout.write(`  ↓  ${name} ... `)

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'HabitatCafe/1.0 (asset downloader)',
            },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await pipeline(res.body, createWriteStream(filePath))

        // Record both old URL variants (w=600 and w=400 versions used in code)
        const oldUrl600 = `https://images.unsplash.com/${photoId}?w=600&auto=format&fit=crop&q=80`
        const oldUrl400 = `https://images.unsplash.com/${photoId}?w=400&auto=format&fit=crop&q=80`
        mapping[oldUrl600] = localPath
        mapping[oldUrl400] = localPath

        console.log(`✓  → ${localPath}`)
    } catch (err) {
        console.log(`✗  FAILED: ${err.message}`)
    }
}

/* ─── Main ──────────────────────────────────────────────────────────────── */
console.log('\n🌿 Habitat Asset Downloader')
console.log(`   Output: ${OUTPUT_DIR}\n`)

// Download sequentially to avoid rate-limiting
for (const img of IMAGES) {
    await download(img)
}

// Write mapping file
const mappingPath = path.join(__dirname, 'mapping.json')
writeFileSync(mappingPath, JSON.stringify(mapping, null, 2))
console.log(`\n✅ Done! ${IMAGES.length} images downloaded.`)
console.log(`📄 Mapping written to: mapping.json\n`)
