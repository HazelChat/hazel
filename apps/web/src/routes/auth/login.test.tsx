import { render, waitFor } from "@testing-library/react"
import { StrictMode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const getMockLoginSearch = () =>
	(
		globalThis as typeof globalThis & {
			__authLoginSearch: {
				returnTo?: string
				organizationId?: string
				invitationToken?: string
			}
		}
	).__authLoginSearch

const getMockUseAuth = () =>
	(
		globalThis as typeof globalThis & {
			__authLoginUseAuth: ReturnType<typeof vi.fn>
		}
	).__authLoginUseAuth

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (config: Record<string, unknown>) => ({
		...config,
		useSearch: () => getMockLoginSearch(),
	}),
	Navigate: () => null,
}))

vi.mock("../../lib/auth", () => ({
	useAuth: () => (getMockUseAuth() as () => ReturnType<typeof getMockUseAuth>)(),
}))

import { resetAllWebLoginRedirects } from "~/lib/web-login-single-flight"
import { LoginPage } from "./login"

describe("/auth/login", () => {
	beforeEach(() => {
		resetAllWebLoginRedirects()
		const mockLogin = vi.fn()
		;(
			globalThis as typeof globalThis & {
				__authLoginSearch: {
					returnTo?: string
					organizationId?: string
					invitationToken?: string
				}
				__authLoginUseAuth: ReturnType<typeof vi.fn>
				__authLoginFn: ReturnType<typeof vi.fn>
			}
		).__authLoginSearch = {
			returnTo: "/",
			organizationId: undefined,
			invitationToken: undefined,
		}
		;(globalThis as typeof globalThis & { __authLoginFn: ReturnType<typeof vi.fn> }).__authLoginFn =
			mockLogin
		;(
			globalThis as typeof globalThis & { __authLoginUseAuth: ReturnType<typeof vi.fn> }
		).__authLoginUseAuth = vi.fn()
		getMockUseAuth().mockReturnValue({
			user: null,
			login: mockLogin,
			isLoading: false,
		})
	})

	it("starts login once under StrictMode for the same search params", async () => {
		render(
			<StrictMode>
				<LoginPage />
			</StrictMode>,
		)

		await waitFor(() => {
			expect(
				(globalThis as typeof globalThis & { __authLoginFn: ReturnType<typeof vi.fn> }).__authLoginFn,
			).toHaveBeenCalledTimes(1)
		})

		expect(
			(globalThis as typeof globalThis & { __authLoginFn: ReturnType<typeof vi.fn> }).__authLoginFn,
		).toHaveBeenCalledWith({
			returnTo: "/",
			organizationId: undefined,
			invitationToken: undefined,
		})
	})
})
