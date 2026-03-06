jest.mock("expo-sharing", () => ({}));
jest.mock("expo-file-system", () => ({}));
jest.mock("react-native", () => ({ Platform: { OS: "web" } }));

import { generateCSV } from "../lib/export";

describe("generateCSV", () => {
  it("generates CSV with correct header and rows", () => {
    const contributions = [
      {
        id: "1",
        group_id: "g1",
        user_id: "u1",
        amount: 50,
        note: "Weekly save",
        proof_url: null,
        created_at: "2024-03-01T10:00:00Z",
        user: { name: "Alice", email: "alice@test.com" },
      },
      {
        id: "2",
        group_id: "g1",
        user_id: "u2",
        amount: 100,
        note: null,
        proof_url: null,
        created_at: "2024-03-02T12:00:00Z",
        user: { name: "Bob", email: "bob@test.com" },
      },
    ];

    const csv = generateCSV(contributions as any, "Test Group");
    const lines = csv.split("\n");

    expect(lines[0]).toBe("Date,Member,Email,Amount,Note");
    expect(lines[1]).toContain("2024-03-01");
    expect(lines[1]).toContain("Alice");
    expect(lines[1]).toContain("50");
    expect(lines[2]).toContain("Bob");
    expect(lines[2]).toContain("100");
  });

  it("handles commas in notes", () => {
    const contributions = [
      {
        id: "1",
        group_id: "g1",
        user_id: "u1",
        amount: 25,
        note: "Saved for rent, food",
        proof_url: null,
        created_at: "2024-03-01T10:00:00Z",
        user: { name: "Alice, Jr", email: "a@test.com" },
      },
    ];

    const csv = generateCSV(contributions as any, "Group");
    // Commas in name and note should be sanitized (no raw commas in fields)
    expect(csv).not.toContain("Alice, Jr");
    expect(csv).toContain("Alice");
    expect(csv).not.toContain("rent, food");
  });

  it("returns header only for empty contributions", () => {
    const csv = generateCSV([], "Empty");
    expect(csv).toBe("Date,Member,Email,Amount,Note\n");
  });
});
