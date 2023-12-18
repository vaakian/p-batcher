import { test, expect, describe, vi } from "vitest"
import { createPBatch } from "../src"

describe("batcher", () => {
  const mockFetch = vi.fn((keys: number[]) => keys.map((k) => `response-${k}`))
  const get = createPBatch(mockFetch, { maxBatchSize: 3 })

  test("single call", async () => {
    expect(await get(1)).toBe("response-1")
  })

  test("multiple calls", async () => {
    const data = await Promise.all([1, 2, 3, 4, 5].map((k) => get(k)))

    expect(data).toEqual([
      "response-1",
      "response-2",
      "response-3",
      "response-4",
      "response-5",
    ])
    expect(mockFetch).toMatchSnapshot()
  })
})
