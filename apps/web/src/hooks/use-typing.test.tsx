import { renderHook, act } from "@testing-library/react"
import { Exit } from "effect"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useTyping } from "./use-typing"

const { upsertMutationSymbol, deleteMutationSymbol, upsertMock, deleteMock } = vi.hoisted(() => ({
	upsertMutationSymbol: Symbol.for("typing.upsert"),
	deleteMutationSymbol: Symbol.for("typing.delete"),
	upsertMock: vi.fn(),
	deleteMock: vi.fn(),
}))

vi.mock("~/atoms/typing-indicator-atom", () => ({
	upsertTypingIndicatorMutation: upsertMutationSymbol,
	deleteTypingIndicatorMutation: deleteMutationSymbol,
}))

vi.mock("~/lib/typing-diagnostics", () => ({
	pushTypingDiagnostics: vi.fn(),
}))

vi.mock("@effect-atom/atom-react", () => ({
	useAtomSet: vi.fn((mutation: unknown) => {
		if (mutation === upsertMutationSymbol) return upsertMock
		if (mutation === deleteMutationSymbol) return deleteMock
		throw new Error("Unknown mutation atom in useTyping test")
	}),
}))

const flushMicrotasks = async () => {
	await act(async () => {
		await Promise.resolve()
	})
}

describe("useTyping", () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"))
		upsertMock.mockReset()
		deleteMock.mockReset()
		upsertMock.mockResolvedValue(
			Exit.succeed({
				data: { id: "typing-indicator-1" },
				transactionId: 1,
			}) as any,
		)
		deleteMock.mockResolvedValue(
			Exit.succeed({
				data: { id: "typing-indicator-1" },
				transactionId: 1,
			}) as any,
		)
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it("sends heartbeat immediately on first non-empty content and throttles subsequent heartbeats", async () => {
		const { result } = renderHook(() =>
			useTyping({
				channelId: "channel-1" as any,
				memberId: "member-1" as any,
				heartbeatInterval: 1500,
			}),
		)

		act(() => {
			result.current.handleContentChange("h")
		})
		await flushMicrotasks()
		expect(upsertMock).toHaveBeenCalledTimes(1)

		act(() => {
			result.current.handleContentChange("he")
		})
		await flushMicrotasks()
		expect(upsertMock).toHaveBeenCalledTimes(1)

		act(() => {
			vi.advanceTimersByTime(1500)
		})
		act(() => {
			result.current.handleContentChange("hel")
		})
		await flushMicrotasks()
		expect(upsertMock).toHaveBeenCalledTimes(2)
	})

	it("deletes typing indicator when content becomes empty", async () => {
		const { result } = renderHook(() =>
			useTyping({
				channelId: "channel-1" as any,
				memberId: "member-1" as any,
			}),
		)

		act(() => {
			result.current.handleContentChange("hello")
		})
		await flushMicrotasks()

		act(() => {
			result.current.handleContentChange("")
		})
		await flushMicrotasks()

		expect(deleteMock).toHaveBeenCalledTimes(1)
		expect(deleteMock).toHaveBeenCalledWith({
			payload: {
				id: "typing-indicator-1",
			},
		})
	})

	it("auto-stops after typing timeout and deletes indicator", async () => {
		const { result } = renderHook(() =>
			useTyping({
				channelId: "channel-1" as any,
				memberId: "member-1" as any,
				typingTimeout: 3000,
			}),
		)

		act(() => {
			result.current.handleContentChange("hello")
		})
		await flushMicrotasks()
		expect(result.current.isTyping).toBe(true)

		await act(async () => {
			vi.advanceTimersByTime(3000)
			await Promise.resolve()
		})

		expect(result.current.isTyping).toBe(false)
		expect(deleteMock).toHaveBeenCalledTimes(1)
	})

	it("cleans up previous indicator when channel/member context changes", async () => {
		const { result, rerender } = renderHook(
			(props: { channelId: string; memberId: string }) =>
				useTyping({
					channelId: props.channelId as any,
					memberId: props.memberId as any,
				}),
			{
				initialProps: {
					channelId: "channel-1",
					memberId: "member-1",
				},
			},
		)

		act(() => {
			result.current.handleContentChange("hello")
		})
		await flushMicrotasks()

		rerender({
			channelId: "channel-2",
			memberId: "member-2",
		})
		await flushMicrotasks()

		expect(deleteMock).toHaveBeenCalledTimes(1)
		expect(deleteMock).toHaveBeenCalledWith({
			payload: {
				id: "typing-indicator-1",
			},
		})
	})
})
