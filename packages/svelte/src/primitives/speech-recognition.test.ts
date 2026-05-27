import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createSpeechRecognition } from "./speech-recognition.svelte.js";

describe("createSpeechRecognition", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports unsupported when API is unavailable", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createSpeechRecognition, onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(false);
  });

  it("starts and stops recognition", () => {
    let started = false;
    let stopped = false;
    const MockRecognition = class {
      lang = "";
      continuous = false;
      interimResults = false;
      onresult: any = null;
      onerror: any = null;
      onend: any = null;
      start() {
        started = true;
      }
      stop() {
        stopped = true;
        this.onend?.();
      }
    };
    vi.stubGlobal("SpeechRecognition", MockRecognition);

    let api: any;
    render(TestUtil, {
      props: { factory: createSpeechRecognition, onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(true);

    api.start();
    expect(started).toBe(true);
    expect(api.listening).toBe(true);

    api.stop();
    expect(stopped).toBe(true);
    expect(api.listening).toBe(false);
  });
});
