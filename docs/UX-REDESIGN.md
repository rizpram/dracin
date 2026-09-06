# DRACIN Premium UX

Production keeps the existing Next.js provider engine. UI is mobile-first and vertical-video oriented.

## User navigation
- Home: curated content + provider directory
- Explore: genre/provider discovery
- Search: rate-aware cross-provider search
- Detail: synopsis, provider, favorites, episode list
- Watch: 9:16 player, skip controls, next episode countdown
- Favorites / History: local device persistence

## Source strategy
- Captain remains primary.
- Sansekai appears only for provider coverage not already present in Captain.
- Search uses a curated audited subset rather than a 42-provider fan-out.
- Audit remains available at `/admin` -> `/audit`, but is removed from end-user bottom navigation.

## Playback safety
The player only uses stream URLs already resolved by the existing safe provider layer. Unlock/decrypt/DRM bypass routes are not added to the UI.
