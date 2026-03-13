// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { OrganizationId } from "@hazel/schema"
import type { InputHTMLAttributes, ReactNode } from "react"

const { workspaceSearchMutation, createConnectInviteMutation, searchWorkspacesMock, createInviteMock } =
	vi.hoisted(() => ({
		workspaceSearchMutation: Symbol("workspaceSearchMutation"),
		createConnectInviteMutation: Symbol("createConnectInviteMutation"),
		searchWorkspacesMock: vi.fn(),
		createInviteMock: vi.fn(),
	}))

vi.mock("@effect-atom/atom-react", () => ({
	useAtomSet: (mutation: symbol) =>
		mutation === workspaceSearchMutation ? searchWorkspacesMock : createInviteMock,
}))

vi.mock("~/atoms/connect-share-atoms", () => ({
	workspaceSearchMutation,
	createConnectInviteMutation,
}))

vi.mock("~/lib/toast-exit", () => ({
	exitToastAsync: (_promise: unknown) => {
		let onSuccess: (() => void) | undefined
		const chain = {
			loading: () => chain,
			onSuccess: (callback: () => void) => {
				onSuccess = callback
				return chain
			},
			successMessage: () => chain,
			onErrorTag: () => chain,
			run: async () => {
				onSuccess?.()
			},
		}

		return chain
	},
}))

vi.mock("~/components/ui/modal", () => ({
	Modal: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
		isOpen ? <div>{children}</div> : null,
	ModalBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	ModalContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	ModalFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	ModalHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	ModalTitle: ({ children }: { children: ReactNode }) => <h1>{children}</h1>,
}))

vi.mock("~/components/ui/button", () => ({
	Button: ({
		children,
		onPress,
		onClick,
		isDisabled,
		type = "button",
	}: {
		children: ReactNode
		onPress?: () => void
		onClick?: () => void
		isDisabled?: boolean
		type?: "button" | "submit"
	}) => (
		<button type={type} disabled={isDisabled} onClick={onPress ?? onClick}>
			{children}
		</button>
	),
}))

vi.mock("~/components/ui/input", () => ({
	Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}))

vi.mock("~/components/ui/field", () => ({
	Description: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	Label: ({ children }: { children: ReactNode }) => <label>{children}</label>,
}))

vi.mock("~/components/ui/text-field", () => ({
	TextField: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock("~/components/ui/avatar", () => ({
	Avatar: () => <div />,
}))

vi.mock("~/components/ui/loader", () => ({
	Loader: () => <div>Loading</div>,
}))

vi.mock("~/components/ui/switch", () => ({
	Switch: ({
		children,
		isSelected,
		onChange,
	}: {
		children: ReactNode
		isSelected: boolean
		onChange: (value: boolean) => void
	}) => (
		<label>
			<input
				type="checkbox"
				checked={isSelected}
				onChange={(event) => onChange(event.target.checked)}
			/>
			{children}
		</label>
	),
	SwitchLabel: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}))

vi.mock("~/components/icons/icon-close", () => ({
	IconClose: () => <span>x</span>,
}))

import { ShareChannelModal } from "./share-channel-modal"

const ORG_ID = "00000000-0000-0000-0000-000000000101" as OrganizationId

describe("ShareChannelModal", () => {
	beforeEach(() => {
		searchWorkspacesMock.mockReset()
		createInviteMock.mockReset()
	})

	it("disables workspaces without a shareable slug and submits invites using the slug target", async () => {
		searchWorkspacesMock.mockResolvedValue({
			_tag: "Success",
			value: {
				data: [
					{
						id: ORG_ID,
						name: "No Slug Workspace",
						slug: null,
						logoUrl: null,
					},
					{
						id: "00000000-0000-0000-0000-000000000102" as OrganizationId,
						name: "Guest Workspace",
						slug: "guest-workspace",
						logoUrl: null,
					},
				],
			},
		})
		createInviteMock.mockResolvedValue({ _tag: "Success" })

		render(
			<ShareChannelModal
				isOpen
				onOpenChange={() => undefined}
				channelId={"00000000-0000-0000-0000-000000000201" as any}
				channelName="general"
				organizationId={ORG_ID}
			/>,
		)

		fireEvent.change(screen.getByPlaceholderText("Search public workspaces by name or slug..."), {
			target: { value: "gu" },
		})

		await waitFor(() => {
			expect(searchWorkspacesMock).toHaveBeenCalled()
		})

		await waitFor(() => {
			expect(screen.getByText("No Slug Workspace")).toBeTruthy()
			expect(screen.getByText("Guest Workspace")).toBeTruthy()
		})

		const disabledWorkspaceButton = screen.getByRole("button", { name: /No Slug Workspace/i })
		const shareableWorkspaceButton = screen.getByRole("button", { name: /Guest Workspace/i })

		expect((disabledWorkspaceButton as HTMLButtonElement).disabled).toBe(true)
		expect(screen.getByText("Shareable slug required")).toBeTruthy()

		fireEvent.click(shareableWorkspaceButton)
		fireEvent.click(screen.getByRole("button", { name: "Send invite" }))

		await waitFor(() => {
			expect(createInviteMock).toHaveBeenCalledWith(
				expect.objectContaining({
					payload: expect.objectContaining({
						target: { kind: "slug", value: "guest-workspace" },
					}),
				}),
			)
		})
	})
})
