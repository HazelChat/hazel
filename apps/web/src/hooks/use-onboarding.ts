import { useAtom, useAtomSet } from "@effect-atom/atom-react"
import type { OrganizationId, OrganizationMemberId } from "@hazel/schema"
import { useNavigate } from "@tanstack/react-router"
import { Exit } from "effect"
import { useCallback, useEffect, useRef } from "react"
import { createInvitationMutation } from "~/atoms/invitation-atoms"
import {
	computeStepNumber,
	computeTotalSteps,
	createInitialState,
	getNextStep,
	getPreviousStep,
	onboardingAtomFamily,
	type OnboardingStep,
} from "~/atoms/onboarding-atoms"
import {
	createOrganizationMutation,
	setOrganizationSlugMutation,
	updateOrganizationMemberMetadataMutation,
} from "~/atoms/organization-atoms"
import { finalizeOnboardingMutation } from "~/atoms/user-atoms"
import { useAuth } from "~/lib/auth"

interface UseOnboardingOptions {
	orgId?: OrganizationId
	organization?: {
		id: OrganizationId
		name?: string
		slug?: string
	}
	organizationMemberId?: OrganizationMemberId
}

export function useOnboarding(options: UseOnboardingOptions) {
	const navigate = useNavigate()
	const { user } = useAuth()

	// Use a stable key for the atom (could also use user ID)
	const onboardingAtom = onboardingAtomFamily("onboarding")

	// Atom access
	const [state, setState] = useAtom(onboardingAtom)

	// Mutations with promiseExit mode
	const createOrganization = useAtomSet(createOrganizationMutation, { mode: "promiseExit" })
	const setOrganizationSlug = useAtomSet(setOrganizationSlugMutation, { mode: "promiseExit" })
	const updateMemberMetadata = useAtomSet(updateOrganizationMemberMetadataMutation, {
		mode: "promiseExit",
	})
	const finalizeOnboarding = useAtomSet(finalizeOnboardingMutation, { mode: "promiseExit" })
	const createInvitation = useAtomSet(createInvitationMutation, { mode: "promiseExit" })

	// Track if we've initialized with the options
	const hasInitialized = useRef(false)

	// Initialize state with options on mount
	useEffect(() => {
		if (hasInitialized.current) return
		hasInitialized.current = true

		const initialState = createInitialState({
			orgId: options.orgId,
			organization: options.organization,
		})

		setState(initialState)
	}, [options.orgId, options.organization, setState])

	// Update user type if options change after initial load
	useEffect(() => {
		if (!hasInitialized.current) return

		const userType = options.orgId && options.organization?.slug ? "invited" : "creator"
		setState((prev) => ({
			...prev,
			userType,
			initialOrgId: options.orgId,
			initialOrganization: options.organization,
		}))
	}, [options.orgId, options.organization?.slug, options.organization, setState])

	// Navigation helpers
	const goBack = useCallback(() => {
		setState((prev) => {
			const previousStep = getPreviousStep(prev.currentStep, prev.userType)
			if (!previousStep) return prev
			return {
				...prev,
				currentStep: previousStep,
				direction: "backward" as const,
				error: undefined,
			}
		})
	}, [setState])

	const goToStep = useCallback(
		(step: OnboardingStep) => {
			setState((prev) => ({
				...prev,
				currentStep: step,
				direction: "forward" as const,
				error: undefined,
			}))
		},
		[setState],
	)

	// Step handlers - update data and advance
	const handleWelcomeContinue = useCallback(() => {
		setState((prev) => ({
			...prev,
			currentStep: getNextStep(prev.currentStep, prev.userType) ?? prev.currentStep,
			direction: "forward" as const,
		}))
	}, [setState])

	const handleProfileInfoContinue = useCallback(
		(data: { firstName: string; lastName: string }) => {
			setState((prev) => ({
				...prev,
				data: { ...prev.data, ...data },
				currentStep: getNextStep(prev.currentStep, prev.userType) ?? prev.currentStep,
				direction: "forward" as const,
			}))
		},
		[setState],
	)

	const handleTimezoneContinue = useCallback(
		(data: { timezone: string }) => {
			setState((prev) => ({
				...prev,
				data: { ...prev.data, ...data },
				currentStep: getNextStep(prev.currentStep, prev.userType) ?? prev.currentStep,
				direction: "forward" as const,
			}))
		},
		[setState],
	)

	const handleThemeContinue = useCallback(
		(data: { theme: "dark" | "light" | "system"; brandColor: string }) => {
			setState((prev) => ({
				...prev,
				data: { ...prev.data, ...data },
				currentStep: getNextStep(prev.currentStep, prev.userType) ?? prev.currentStep,
				direction: "forward" as const,
			}))
		},
		[setState],
	)

	// Async org setup handler
	const handleOrgSetupContinue = useCallback(
		async (data: { name: string; slug: string; organizationId: string }) => {
			setState((prev) => ({ ...prev, isProcessing: true, error: undefined }))

			try {
				let effectiveOrgId: OrganizationId | undefined =
					state.initialOrgId || state.data.createdOrgId || (data.organizationId as OrganizationId)

				if (!effectiveOrgId) {
					// Create new organization
					const result = await createOrganization({
						payload: {
							name: data.name,
							slug: data.slug,
							logoUrl: null,
							settings: null,
						},
					})

					if (Exit.isSuccess(result)) {
						effectiveOrgId = result.value.data.id
					} else {
						throw new Error("Failed to create organization")
					}
				} else {
					// Update slug
					const result = await setOrganizationSlug({
						payload: { id: effectiveOrgId, slug: data.slug },
					})

					if (!Exit.isSuccess(result)) {
						throw new Error("Failed to set organization slug")
					}
				}

				setState((prev) => ({
					...prev,
					data: {
						...prev.data,
						orgName: data.name,
						orgSlug: data.slug,
						createdOrgId: effectiveOrgId,
					},
					currentStep: getNextStep(prev.currentStep, prev.userType) ?? prev.currentStep,
					direction: "forward" as const,
					isProcessing: false,
				}))
			} catch (error) {
				setState((prev) => ({
					...prev,
					isProcessing: false,
					error: error instanceof Error ? error.message : "Failed to set up organization",
				}))
			}
		},
		[state.initialOrgId, state.data.createdOrgId, createOrganization, setOrganizationSlug, setState],
	)

	const handleUseCasesContinue = useCallback(
		(useCases: string[]) => {
			setState((prev) => ({
				...prev,
				data: { ...prev.data, useCases },
				currentStep: getNextStep(prev.currentStep, prev.userType) ?? prev.currentStep,
				direction: "forward" as const,
			}))
		},
		[setState],
	)

	const handleRoleContinue = useCallback(
		(role: string) => {
			setState((prev) => ({
				...prev,
				data: { ...prev.data, role },
				currentStep: getNextStep(prev.currentStep, prev.userType) ?? prev.currentStep,
				direction: "forward" as const,
			}))
		},
		[setState],
	)

	const handleTeamInviteContinue = useCallback(
		(emails: string[]) => {
			setState((prev) => ({
				...prev,
				data: { ...prev.data, emails },
				currentStep: "finalization" as const,
				direction: "forward" as const,
			}))
		},
		[setState],
	)

	const handleTeamInviteSkip = useCallback(() => {
		setState((prev) => ({
			...prev,
			data: { ...prev.data, emails: [] },
			currentStep: "finalization" as const,
			direction: "forward" as const,
		}))
	}, [setState])

	// Finalization handler
	const handleFinalization = useCallback(async () => {
		setState((prev) => ({ ...prev, isProcessing: true, error: undefined }))

		try {
			const orgId = state.initialOrgId || state.data.createdOrgId
			if (!orgId) {
				throw new Error("Organization ID is required")
			}

			// Save member metadata
			if (options.organizationMemberId && user?.id) {
				const metadataResult = await updateMemberMetadata({
					payload: {
						id: options.organizationMemberId,
						metadata: {
							role: state.data.role,
							useCases: state.data.useCases,
						},
					},
				})

				if (!Exit.isSuccess(metadataResult)) {
					console.error("Failed to save onboarding metadata:", metadataResult.cause)
				}
			}

			// Finalize onboarding
			const finalizeResult = await finalizeOnboarding({
				payload: void 0,
				reactivityKeys: ["currentUser"],
			})

			if (!Exit.isSuccess(finalizeResult)) {
				console.error("Failed to finalize onboarding:", finalizeResult.cause)
			}

			// Send invitations
			if (state.data.emails.length > 0) {
				const inviteResult = await createInvitation({
					payload: {
						organizationId: orgId,
						invites: state.data.emails.map((email) => ({ email, role: "member" })),
					},
				})

				if (Exit.isSuccess(inviteResult)) {
					console.log(`Sent ${inviteResult.value.successCount} invitations`)
				}
			}

			// Navigate to organization
			const slug = state.data.orgSlug || state.initialOrganization?.slug
			if (slug) {
				navigate({ to: "/$orgSlug", params: { orgSlug: slug } })
			} else {
				navigate({ to: "/" })
			}

			setState((prev) => ({
				...prev,
				currentStep: "completed" as const,
				isProcessing: false,
			}))
		} catch (error) {
			setState((prev) => ({
				...prev,
				isProcessing: false,
				error: error instanceof Error ? error.message : "Failed to complete onboarding",
				// Go back to role step on error
				currentStep: "role" as const,
			}))
		}
	}, [
		state.initialOrgId,
		state.data.createdOrgId,
		state.data.role,
		state.data.useCases,
		state.data.emails,
		state.data.orgSlug,
		state.initialOrganization?.slug,
		options.organizationMemberId,
		user?.id,
		updateMemberMetadata,
		finalizeOnboarding,
		createInvitation,
		navigate,
		setState,
	])

	// Auto-trigger finalization when reaching that step
	const finalizationTriggered = useRef(false)
	useEffect(() => {
		if (state.currentStep === "finalization" && !state.isProcessing && !finalizationTriggered.current) {
			finalizationTriggered.current = true
			handleFinalization()
		}

		// Reset the flag if we go back from finalization
		if (state.currentStep !== "finalization") {
			finalizationTriggered.current = false
		}
	}, [state.currentStep, state.isProcessing, handleFinalization])

	return {
		// State
		currentStep: state.currentStep,
		direction: state.direction,
		userType: state.userType,
		data: state.data,
		isProcessing: state.isProcessing,
		error: state.error,

		// Progress indicator
		currentStepNumber: computeStepNumber(state),
		totalSteps: computeTotalSteps(state),
		isCreator: state.userType === "creator",

		// Navigation
		goBack,
		goToStep,

		// Step handlers
		handleWelcomeContinue,
		handleProfileInfoContinue,
		handleTimezoneContinue,
		handleThemeContinue,
		handleOrgSetupContinue,
		handleUseCasesContinue,
		handleRoleContinue,
		handleTeamInviteContinue,
		handleTeamInviteSkip,

		// Initial data for defaultValues
		initialOrganization: state.initialOrganization,
	}
}
