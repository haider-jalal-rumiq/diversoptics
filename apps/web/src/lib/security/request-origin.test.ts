import { describe, expect, it } from "vitest";

import { isJsonRequest, isSameOriginRequest } from "./request-origin";

const SITE = "https://diverso.example";

function requestWith(headers: Record<string, string>): Request {
  return new Request(`${SITE}/api/cms/products/1/media/upload-token`, {
    headers,
    method: "POST",
  });
}

describe("isSameOriginRequest", () => {
  it("accepts a request whose Origin matches the request URL", () => {
    expect(isSameOriginRequest(requestWith({ origin: SITE }))).toBe(true);
  });

  it("rejects a cross-site origin", () => {
    expect(
      isSameOriginRequest(requestWith({ origin: "https://attacker.example" })),
    ).toBe(false);
  });

  it("rejects a missing or opaque origin", () => {
    expect(isSameOriginRequest(requestWith({}))).toBe(false);
    expect(isSameOriginRequest(requestWith({ origin: "null" }))).toBe(false);
  });

  it("does not accept a sibling subdomain or another port", () => {
    expect(
      isSameOriginRequest(
        requestWith({ origin: "https://evil.diverso.example" }),
      ),
    ).toBe(false);
    expect(
      isSameOriginRequest(
        requestWith({ origin: "https://diverso.example:8443" }),
      ),
    ).toBe(false);
  });

  it("compares against the forwarded host and protocol a proxy supplies", () => {
    // The runtime URL names an internal address; the browser addressed the public one.
    const behindProxy = new Request("http://internal.local/api/upload", {
      headers: {
        origin: SITE,
        "x-forwarded-host": "diverso.example",
        "x-forwarded-proto": "https",
      },
      method: "POST",
    });

    expect(isSameOriginRequest(behindProxy)).toBe(true);
  });

  it("accepts 127.0.0.1 when the runtime reports localhost", () => {
    const local = new Request("http://localhost:3000/api/upload", {
      headers: {
        origin: "http://127.0.0.1:3000",
        "x-forwarded-host": "127.0.0.1:3000",
        "x-forwarded-proto": "http",
      },
      method: "POST",
    });

    expect(isSameOriginRequest(local)).toBe(true);
  });

  it("ignores a second forwarded value and keeps the first", () => {
    const chained = new Request("http://internal.local/api/upload", {
      headers: {
        origin: SITE,
        "x-forwarded-host": "diverso.example, edge.internal",
        "x-forwarded-proto": "https, http",
      },
      method: "POST",
    });

    expect(isSameOriginRequest(chained)).toBe(true);
  });
});

describe("isJsonRequest", () => {
  it("accepts application/json with or without parameters", () => {
    expect(
      isJsonRequest(requestWith({ "content-type": "application/json" })),
    ).toBe(true);
    expect(
      isJsonRequest(
        requestWith({ "content-type": "Application/JSON; charset=utf-8" }),
      ),
    ).toBe(true);
  });

  it("rejects form and plain-text bodies", () => {
    expect(
      isJsonRequest(
        requestWith({ "content-type": "text/plain;charset=UTF-8" }),
      ),
    ).toBe(false);
    expect(
      isJsonRequest(
        requestWith({ "content-type": "application/x-www-form-urlencoded" }),
      ),
    ).toBe(false);
    expect(isJsonRequest(requestWith({}))).toBe(false);
  });
});
