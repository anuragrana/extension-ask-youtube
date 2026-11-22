const SETTLE_MS = 2000; // extra wait after the page reports the new video

const PROMPT = "summarise this video in 3-5 bullet points";

const SEL = {
  entry: "button-view-model.you-chat-entrypoint-button button",
  input: "textarea.chatInputViewModelChatInput",
};

let doneFor = null; // video id already handled

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(fn, timeout = 15000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const v = fn();
    if (v) return v;
    await sleep(250);
  }
  return null;
}

function pauseVideo() {
  const v = document.querySelector("video.html5-main-video");
  if (v && !v.paused) v.pause();
}

function videoId() {
  return new URL(location.href).searchParams.get("v");
}

async function run() {
  const id = videoId();
  if (location.pathname !== "/watch" || !id || id === doneFor) return;
  doneFor = id;

  // Wait until the watch page itself reports this video (not the previous one).
  const ready = await waitFor(
    () => document.querySelector("ytd-watch-flexy")?.getAttribute("video-id") === id, 20000);
  if (!ready) return console.warn("[auto-ask] watch page never settled");
  await sleep(SETTLE_MS);
  if (videoId() !== id) return;
  pauseVideo(); // stop the audio while the summary is being generated

  // Recommendations load last; the Ask button may be re-created when they do.
  await waitFor(() => document.querySelector(
    "#secondary ytd-compact-video-renderer, #secondary yt-lockup-view-model"), 20000);
  await sleep(1000);
  if (videoId() !== id) return;

  // Click Ask and wait for the input; retry the whole open step once.
  let input = null;
  for (let attempt = 1; attempt <= 2 && !input; attempt++) {
    const entry = await waitFor(() => document.querySelector(SEL.entry), 40000);
    if (!entry || videoId() !== id) return console.warn("[auto-ask] Ask button not found");
    entry.click();
    input = await waitFor(() => document.querySelector(SEL.input), 8000);
    if (!input) console.warn(`[auto-ask] input not found (attempt ${attempt})`);
  }
  if (!input || videoId() !== id) return console.warn("[auto-ask] giving up: input not found");

  // Native setter + InputEvent so the page's framework registers the text.
  input.focus();
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
  setter.call(input, PROMPT);
  input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: PROMPT }));

  // Submit with Enter (the Send button doesn't reliably enable).
  await sleep(300);
  const opts = { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true };
  input.dispatchEvent(new KeyboardEvent("keydown", opts));
  input.dispatchEvent(new KeyboardEvent("keypress", opts));
  input.dispatchEvent(new KeyboardEvent("keyup", opts));
  pauseVideo(); // in case autoplay resumed meanwhile
}

window.addEventListener("yt-navigate-finish", run); // in-page navigation
run(); // direct page load
