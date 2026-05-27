/**
 * Reactive Speech Recognition (Web Speech API) wrapper backed by Svelte 5 `$state`.
 *
 * Wraps `SpeechRecognition` to provide reactive `listening`, `transcript`,
 * and `interim` state. SSR-safe — defaults to unsupported when the API
 * is unavailable.
 *
 * @param opts - Optional `SpeechRecognition`-compatible options.
 * @returns `{ listening, transcript, interim, error, isSupported, start, stop }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createSpeechRecognition } from "@anyhow/svelte";
 *   const speech = createSpeechRecognition({ lang: "en-US" });
 * </script>
 *
 * <button onclick={() => speech.start()}>🎤 Listen</button>
 * <p>{speech.transcript}</p>
 * ```
 */
export function createSpeechRecognition(opts?: {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}) {
  let listening = $state(false);
  let transcript = $state("");
  let interim = $state("");
  let error = $state<Error | undefined>(undefined);
  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  let recognition: any = null;

  $effect(() => {
    return () => {
      recognition?.stop();
      recognition = null;
    };
  });

  return {
    /** Whether recognition is currently active. */
    get listening() {
      return listening;
    },
    /** The final transcript from the most recent recognition. */
    get transcript() {
      return transcript;
    },
    /** Interim (partial) results during recognition. */
    get interim() {
      return interim;
    },
    /** Set when recognition encounters an error. */
    get error() {
      return error;
    },
    /** Whether the Speech Recognition API is supported. */
    get isSupported() {
      return isSupported;
    },
    /** Starts speech recognition. */
    start() {
      if (!isSupported) return;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      if (opts?.lang) recognition.lang = opts.lang;
      if (opts?.continuous !== undefined) recognition.continuous = opts.continuous;
      if (opts?.interimResults !== undefined) recognition.interimResults = opts.interimResults;

      recognition.onresult = (e: any) => {
        let final = "";
        let inter = "";
        for (let i = 0; i < e.results.length; i++) {
          const result = e.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            inter += result[0].transcript;
          }
        }
        if (final) transcript = final;
        interim = inter;
      };

      recognition.onerror = (e: any) => {
        error = new Error(e.error ?? "Speech recognition error");
        listening = false;
      };

      recognition.onend = () => {
        listening = false;
      };

      listening = true;
      recognition.start();
    },
    /** Stops speech recognition. */
    stop() {
      if (!recognition) return;
      recognition.stop();
      listening = false;
    },
  };
}
