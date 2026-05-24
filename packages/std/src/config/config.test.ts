import { describe, it, expect, afterEach } from "bun:test";
import { Config } from "./config.js";
import { s } from "../schema/index.js";

// Minimal schema for testing
const AppConfig = s.object({
  port: s.number().default(3000),
  host: s.string().default("0.0.0.0"),
});

const NestedConfig = s.object({
  server: s
    .object({
      port: s.number().default(8080),
      host: s.string().default("localhost"),
    })
    .default({ port: 8080, host: "localhost" }),
  debug: s.boolean().default(false),
});

describe("Config.load", () => {
  it("returns defaults when no sources are provided", async () => {
    const result = await Config.load(AppConfig, { sources: [] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ port: 3000, host: "0.0.0.0" });
    }
  });

  it("fails validation when required fields are missing", async () => {
    const Strict = s.object({ port: s.number() });
    const result = await Config.load(Strict, { sources: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("number");
    }
  });
});

describe("Config.env", () => {
  afterEach(() => {
    delete process.env.TEST_PORT;
    delete process.env.TEST_HOST;
    delete process.env.TEST_SERVER__PORT;
    delete process.env.TEST_SERVER__HOST;
    delete process.env.TEST_DEBUG;
  });

  it("loads flat env vars", async () => {
    process.env.TEST_PORT = "9090";
    process.env.TEST_HOST = "127.0.0.1";

    const result = await Config.load(AppConfig, {
      sources: [Config.env("TEST_")],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.port).toBe(9090);
      expect(result.value.host).toBe("127.0.0.1");
    }
  });

  it("auto-coerces boolean values", async () => {
    process.env.TEST_DEBUG = "true";

    const result = await Config.load(NestedConfig, {
      sources: [Config.env("TEST_")],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.debug).toBe(true);
    }
  });

  it("auto-coerces false boolean values", async () => {
    process.env.TEST_DEBUG = "false";

    const result = await Config.load(NestedConfig, {
      sources: [Config.env("TEST_")],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.debug).toBe(false);
    }
  });

  it("handles nested env vars via __ separator", async () => {
    process.env.TEST_SERVER__PORT = "3000";
    process.env.TEST_SERVER__HOST = "0.0.0.0";

    const result = await Config.load(NestedConfig, {
      sources: [Config.env("TEST_")],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.server).toEqual({ port: 3000, host: "0.0.0.0" });
    }
  });

  it("leaves non-matching env vars untouched", async () => {
    process.env.OTHER_VAR = "ignored";
    process.env.TEST_PORT = "1234";

    const result = await Config.load(AppConfig, {
      sources: [Config.env("TEST_")],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.port).toBe(1234);
    }
  });
});

describe("Config sources merging", () => {
  afterEach(() => {
    delete process.env.TEST_PORT;
    delete process.env.TEST_HOST;
  });

  it("later sources override earlier ones", async () => {
    process.env.TEST_PORT = "9999";

    // env overrides defaults
    const result = await Config.load(AppConfig, {
      sources: [Config.env("TEST_")],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.port).toBe(9999);
      expect(result.value.host).toBe("0.0.0.0"); // default
    }
  });

  it("handles multiple env sources (last wins)", async () => {
    process.env.A_PORT = "1111";
    process.env.B_PORT = "2222";

    const result = await Config.load(AppConfig, {
      sources: [Config.env("A_"), Config.env("B_")],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.port).toBe(2222);
    }
  });
});

describe("Config.generateDotEnv", () => {
  it("generates flat keys with prefix", () => {
    const output = Config.generateDotEnv(AppConfig, { prefix: "APP_" });
    expect(output).toContain("APP_PORT=");
    expect(output).toContain("APP_HOST=");
  });

  it("generates nested keys with __ separator", () => {
    const output = Config.generateDotEnv(NestedConfig, { prefix: "APP_" });
    expect(output).toContain("APP_SERVER__PORT=");
    expect(output).toContain("APP_SERVER__HOST=");
    expect(output).toContain("APP_DEBUG=");
  });

  it("generates without prefix", () => {
    const output = Config.generateDotEnv(AppConfig);
    expect(output).toContain("PORT=");
    expect(output).not.toContain("APP_");
  });
});

describe("Config.args", () => {
  // Helper to simulate CLI args
  function withArgs(args: string[], fn: () => Promise<void>) {
    const saved = process.argv;
    return async () => {
      process.argv = ["node", "script.js", ...args];
      try {
        await fn();
      } finally {
        process.argv = saved;
      }
    };
  }

  it("parses --key=value", async () => {
    await withArgs(["--port=8080"], async () => {
      const result = await Config.load(AppConfig, {
        sources: [Config.args()],
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.port).toBe(8080);
      }
    })();
  });

  it("parses --key value", async () => {
    await withArgs(["--port", "7070"], async () => {
      const result = await Config.load(AppConfig, {
        sources: [Config.args()],
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.port).toBe(7070);
      }
    })();
  });

  it("parses --flag as boolean true", async () => {
    await withArgs(["--debug"], async () => {
      const result = await Config.load(NestedConfig, {
        sources: [Config.args()],
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.debug).toBe(true);
      }
    })();
  });

  it("parses --no-flag as boolean false", async () => {
    await withArgs(["--no-debug"], async () => {
      const result = await Config.load(NestedConfig, {
        sources: [Config.args()],
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.debug).toBe(false);
      }
    })();
  });

  it("parses --nested.key=value via dot separator", async () => {
    await withArgs(["--server.port=3000", "--server.host=0.0.0.0"], async () => {
      const result = await Config.load(NestedConfig, {
        sources: [Config.args()],
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.server.port).toBe(3000);
        expect(result.value.server.host).toBe("0.0.0.0");
      }
    })();
  });
});
