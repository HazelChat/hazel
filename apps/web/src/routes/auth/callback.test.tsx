import { RegistryContext } from "@effect/atom-react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { StrictMode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { OAuthCodeExpiredError, OAuthStateMismatchError, TokenExchangeError } from "@hazel/domain/errors"

const getMockSearch = () =>
	(
		globalThis as typeof globalThis & {
			__authCallbackSearch: {
				code?: string
				state?: string
				error?: string
				error_description?: string
			}
		}
	).__authCallbackSearch

const getMockNavigate = () =>
	(
		globalThis as typeof globalThis & {
			__authCallbackNavigate: ReturnType<typeof vi.fn>
		}
	).__authCallbackNavigate

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (config: Record<string, unknown>) => ({
		...config,
		useSearch: () => getMockSearch(),
	}),
	useNavigate: () => getMockNavigate(),
}))

import { resetCallbackState, setWebCallbackExecutorForTest } from "~/atoms/web-callback-atoms"
import { appRegistry } from "~/lib/registry"
import { WebCallbackPage } from "./callback"

describe("/auth/callback", () => {
	beforeEach(() => {
		;(
			globalThis as typeof globalThis & {
				__authCallbackSearch: {
					code?: string
					state?: string
					error?: string
					error_description?: string
				}
				__authCallbackNavigate: ReturnType<typeof vi.fn>
			}
		).__authCallbackSearch = {
			code: "test-auth-code",
			state: JSON.stringify({ returnTo: "/" }),
			error: undefined,
			error_description: undefined,
		}
		;(
			globalThis as typeof globalThis & { __authCallbackNavigate: ReturnType<typeof vi.fn> }
		).__authCallbackNavigate = vi.fn()
		resetCallbackState()
		setWebCallbackExecutorForTest(null)
	})

	it("redeems the callback once under StrictMode and lands in success", async () => {
		const executor = vi.fn(async ({ returnTo }: { attemptId: string; returnTo: string }) => ({
			success: true as const,
			returnTo,
		}))
		setWebCallbackExecutorForTest(executor)

		render(
			<StrictMode>
				<RegistryContext.Provider value={appRegistry}>
					<WebCallbackPage />
				</RegistryContext.Provider>
			</StrictMode>,
		)

		expect(await screen.findByText("Authentication Successful")).toBeTruthy()
		expect(executor).toHaveBeenCalledTimes(1)
	})

	it("retries once after a retryable failure and then succeeds", async () => {
		const executor = vi
			.fn<
				(args: {
					attemptId: string
					returnTo: string
				}) => Promise<
					| { success: true; returnTo: string }
					| { success: false; error: TokenExchangeError | OAuthCodeExpiredError }
				>
			>()
			.mockResolvedValueOnce({
				success: false,
				error: new TokenExchangeError({ message: "Temporary exchange failure" }),
			})
			.mockImplementationOnce(async ({ returnTo }) => ({
				success: true,
				returnTo,
			}))
		setWebCallbackExecutorForTest(executor)

		render(
			<StrictMode>
				<RegistryContext.Provider value={appRegistry}>
					<WebCallbackPage />
				</RegistryContext.Provider>
			</StrictMode>,
		)

		expect(await screen.findByText("Authentication Failed")).toBeTruthy()
		expect(executor).toHaveBeenCalledTimes(1)

		fireEvent.click(screen.getByRole("button", { name: "Try Again" }))

		expect(await screen.findByText("Authentication Successful")).toBeTruthy()
		expect(executor).toHaveBeenCalledTimes(2)
	})

	it("keeps non-retryable failures terminal after the first attempt", async () => {
		const executor = vi.fn(async () => ({
			success: false as const,
			error: new OAuthCodeExpiredError({
				message: "Authorization code expired or already used",
			}),
		}))
		setWebCallbackExecutorForTest(executor)

		render(
			<StrictMode>
				<RegistryContext.Provider value={appRegistry}>
					<WebCallbackPage />
				</RegistryContext.Provider>
			</StrictMode>,
		)

		expect(await screen.findByText("Authentication Failed")).toBeTruthy()
		expect(executor).toHaveBeenCalledTimes(1)

		await waitFor(() => {
			expect(screen.queryByRole("button", { name: "Try Again" })).toBeNull()
		})
	})

	it("surfaces typed state-mismatch failures with the simplified message", async () => {
		const executor = vi.fn(async () => ({
			success: false as const,
			error: new OAuthStateMismatchError({
				message: "state mismatch",
			}),
		}))
		setWebCallbackExecutorForTest(executor)

		render(
			<StrictMode>
				<RegistryContext.Provider value={appRegistry}>
					<WebCallbackPage />
				</RegistryContext.Provider>
			</StrictMode>,
		)

		expect(await screen.findByText("Authentication Failed")).toBeTruthy()
		expect(
			screen.getByText("This login callback did not match the active session. Please start again."),
		).toBeTruthy()

		await waitFor(() => {
			expect(screen.queryByRole("button", { name: "Try Again" })).toBeNull()
		})
	})
})
