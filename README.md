# Youtube Auto Ask Summary

A tiny Chrome extension that summarises a YouTube video as soon as you open it.

On each video page it pauses the video, opens YouTube's **Ask** panel and sends:
`summarise this video in 3-5 bullet points`

## Install (developer mode)

1. Download the code: `git clone https://github.com/anuragrana/extension-ask-youtube.git`,
   or **Code > Download ZIP** on GitHub and unzip it.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked**.
5. Select the folder that contains `manifest.json`.
6. Reload any open YouTube tabs, then open a video.

Keep the folder where it is. Chrome loads the extension from it.

**Update:** pull or download the new code, click the reload icon on the extension's
card in `chrome://extensions`, then reload YouTube.

**Disable:** switch off the toggle on the same card.

## Customise

Edit `PROMPT` at the top of `content.js`, then reload the extension.

## Limitations

- Needs the Ask button, which is not available for every account or video.
- Relies on YouTube's page structure and can break when YouTube changes it.
- Runs on every video; there is no per-video off switch.
- The video may play for a few seconds before it is paused.
- AI summaries can be wrong or incomplete.

## Troubleshooting

Open DevTools (F12) > Console and look for messages starting with `[auto-ask]`.
