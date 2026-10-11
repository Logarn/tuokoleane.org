import { describe, expect, it } from "vitest";
import { kindnessPackages } from "./data";
import { donationCatalogue } from "./donation-catalogue";

describe("server-safe donation catalogue", () => {
  it("stays aligned with every public listing", () => {
    expect(donationCatalogue).toEqual(kindnessPackages.map((item) => ({
      id: item.id,
      title: item.title,
      kind: item.kind,
      ...(item.price === undefined ? {} : { price: item.price }),
      ...(item.minimumAmount === undefined ? {} : { minimumAmount: item.minimumAmount }),
    })));
  });
});
