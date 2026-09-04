import { describe, expect, it } from "vitest";

import { catalogNavigation } from "./catalog-navigation";

describe("catalog navigation", () => {
  it("keeps the client-approved top-level shopping order", () => {
    expect(catalogNavigation.map((item) => item.label)).toEqual([
      "Sunglasses",
      "Optical Frames",
      "Pens",
      "Watches",
      "Eyewear",
    ]);
  });

  it("includes the requested eyewear and watch labels", () => {
    const linkLabels = catalogNavigation.flatMap((item) =>
      item.sections.flatMap((section) =>
        section.links.map((link) => link.label),
      ),
    );

    expect(linkLabels).toEqual(
      expect.arrayContaining([
        "Chopard",
        "Tom Ford",
        "Porsche Design",
        "Ray-Ban",
        "Carrera",
        "Swarovski",
        "Louis Vuitton",
        "Montblanc",
        "Casio Edifice",
        "Michael Kors",
        "G-Shock",
      ]),
    );
  });

  it("keeps every destination on a valid catalog base route", () => {
    const links = catalogNavigation.flatMap((item) => [
      { href: item.href },
      ...item.sections.flatMap((section) => section.links),
    ]);

    for (const { href } of links) {
      const url = new URL(href, "https://diverso.example");

      expect([
        "/eyewear",
        "/eyewear/sunglasses",
        "/eyewear/optical-frames",
        "/writing-instruments",
        "/watches",
      ]).toContain(url.pathname);
    }
  });
});
