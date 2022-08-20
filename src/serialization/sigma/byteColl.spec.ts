import { ByteColl } from "./byteColl";

describe("ByteColl type", () => {
  it("Should encode", () => {
    expect(new ByteColl(Buffer.from("Female #05", "utf-8")).toString()).toBe(
      "0e0a46656d616c6520233035"
    );

    expect(
      new ByteColl(
        Buffer.from("Female #05. Pop art portrait of a girl. 4000x4000 px. Author @maritsaart")
      ).toString()
    ).toBe(
      "0e4846656d616c65202330352e20506f702061727420706f727472616974206f662061206769726c2e203430303078343030302070782e20417574686f7220406d617269747361617274"
    );

    expect(new ByteColl(Buffer.from("0", "utf-8")).toString()).toBe("0e0130");
  });
});
