import { useOrganization as useClerkOrganization } from "@clerk/react"
import { useAtom, useAtomSet } from "@effect/atom-react"
import type { OrganizationId, OrganizationMemberId } from "@hazel/schema"
import { Exit } from "effect"
import { usePostHog } from "posthog-js/react"
import { useCallback, useEffect, useMemo, useRef } from "react"
import {
	computeStepNumber,
	computeTotalSteps,
	createInitialState,
	getNextStep,
	getPreviousStep,
	getStepNumber,
	getTotalSteps,
	isValidStepForUser,
	onboardingAtomFamily,
	type OnboardingData,
	type OnboardingStep,
} from "~/atoms/onboarding-atoms"
import {
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
	initialStep?: string
	onStepChange?: (step: OnboardingStep) => void
}

export function useOnboarding(options: UseOnboardingOptions) {
	const { user } = useAuth()
	const posthog = usePostHog()

	// Use a stable key for the atom (could also use user ID)
	const onboardingAtom = onboardingAtomFamily("onboarding")

	// Atom access
	const [state, setState] = useAtom(onboardingAtom)

	// Mutations with promiseExit mode
	const setOrganizationSlug = useAtomSet(setOrganizationSlugMutation, { mode: "promiseExit" })
	const updateMemberMetadata = useAtomSet(updateOrganizationMemberMetadataMutation, {
		mode: "promiseExit",
	})
	const finalizeOnboarding = useAtomSet(finalizeOnboardingMutation, { mode: "promiseExit" })
	const { organization: clerkOrganization } = useClerkOrganization()

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

		// If an initial step is provided via URL and it's valid for this user type, use it
		if (options.initialStep && isValidStepForUser(options.initialStep, initialState.userType)) {
			initialState.currentStep = options.initialStep
		}

		setState(initialState)

		// Track onboarding started
		posthog.capture("onboarding_started", {
			user_type: initialState.userType,
			total_steps: getTotalSteps(initialState.userType),
		})
	}, [options.orgId, options.organization, options.initialStep, setState, posthog])

	// Notify parent when step changes (for URL sync)
	const prevStepRef = useRef<OnboardingStep | null>(null)
	useEffect(() => {
		if (prevStepRef.current !== null && prevStepRef.current !== state.currentStep) {
			options.onStepChange?.(state.currentStep)
		}
		prevStepRef.current = state.currentStep
	}, [state.currentStep, options.onStepChange])

	// Track step views (excluding internal states)
	const hasTrackedStepRef = useRef<Set<OnboardingStep>>(new Set())
	useEffect(() => {
		const step = state.currentStep
		// Skip internal states and already tracked steps
		if (step === "finalization" || step === "completed") return
		if (hasTrackedStepRef.current.has(step)) return

		hasTrackedStepRef.current.add(step)
		posthog.capture("onboarding_step_viewed", {
			step,
			step_number: getStepNumber(step, state.userType),
			user_type: state.userType,
			total_steps: getTotalSteps(state.userType),
		})
	}, [state.currentStep, state.userType, posthog])

	// Helper to track step completion
	const trackStepCompleted = useCallback(
		(step: OnboardingStep, userType: "creator" | "invited") => {
			posthog.capture("onboarding_step_completed", {
				step,
				step_number: getStepNumber(step, userType),
				user_type: userType,
				total_steps: getTotalSteps(userType),
			})
		},
		[posthog],
	)

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

	// Factory for creating simple step handlers that update data and advance
	const createStepHandler = useMemo(
		() =>
			<T extends Partial<OnboardingData>>(transform?: (data: T) => Partial<OnboardingData>) =>
			(data: T) => {
				setState((prev) => {
					trackStepCompleted(prev.currentStep, prev.userType)
					return {
						...prev,
						data: { ...prev.data, ...(transform ? transform(data) : data) },
						currentStep: getNextStep(prev.currentStep, prev.userType) ?? prev.currentStep,
						direction: "forward" as const,
						error: undefined,
					}
				})
			},
		[setState, trackStepCompleted],
	)

	// Simple step handlers using factory
	const handleWelcomeContinue = useCallback(() => {
		setState((prev) => {
			trackStepCompleted(prev.currentStep, prev.userType)
			return {
				...prev,
				currentStep: getNextStep(prev.currentStep, prev.userType) ?? prev.currentStep,
				direction: "forward" as const,
				error: undefined,
			}
		})
	}, [setState, trackStepCompleted])

	const handleProfileInfoContinue = useMemo(
		() => createStepHandler<{ firstName: string; lastName: string }>(),
		[createStepHandler],
	)
	const handleTimezoneContinue = useMemo(
		() => createStepHandler<{ timezone: string }>(),
		[createStepHandler],
	)
	const handleThemeContinue = useMemo(
		() => createStepHandler<{ theme: "dark" | "light" | "system"; brandColor: string }>(),
		[createStepHandler],
	)

	// Org setup handler — the step uses Clerk's <CreateOrganization/> so by the
	// time we land here, the org already exists in both Clerk and (via webhook)
	// our DB. Just record it and advance.
	const handleOrgSetupContinue = useCallback(
		async (data: { name: string; slug: string; organizationId: string }) => {
			setState((prev) => ({ ...prev, isProcessing: true, error: undefined }))

			try {
				const effectiveOrgId = data.organizationId as OrganizationId

				setState((prev) => {
					trackStepCompleted(prev.currentStep, prev.userType)
					return {
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
					}
				})
			} catch (error) {
				setState((prev) => ({
					...prev,
					isProcessing: false,
					error: error instanceof Error ? error.message : "Failed to set up organization",
				}))
			}
		},
		[state.initialOrgId, setOrganizationSlug, setState, trackStepCompleted],
	)

	// These handlers take raw values, not objects
	const handleUseCasesContinue = useCallback(
		(useCases: string[]) => {
			setState((prev) => {
				trackStepCompleted(prev.currentStep, prev.userType)
				return {
					...prev,
					data: { ...prev.data, useCases },
					currentStep: getNextStep(prev.currentStep, prev.userType) ?? prev.currentStep,
					direction: "forward" as const,
					error: undefined,
				}
			})
		},
		[setState, trackStepCompleted],
	)

	const handleRoleContinue = useCallback(
		(role: string) => {
			setState((prev) => {
				trackStepCompleted(prev.currentStep, prev.userType)
				return {
					...prev,
					data: { ...prev.data, role },
					currentStep: getNextStep(prev.currentStep, prev.userType) ?? prev.currentStep,
					direction: "forward" as const,
					error: undefined,
				}
			})
		},
		[setState, trackStepCompleted],
	)

	const handleTeamInviteContinue = useCallback(
		(emails: string[]) => {
			setState((prev) => {
				trackStepCompleted(prev.currentStep, prev.userType)
				return {
					...prev,
					data: { ...prev.data, emails },
					currentStep: "finalization" as const,
					direction: "forward" as const,
				}
			})
		},
		[setState, trackStepCompleted],
	)

	const handleTeamInviteSkip = useCallback(() => {
		setState((prev) => {
			trackStepCompleted(prev.currentStep, prev.userType)
			return {
				...prev,
				data: { ...prev.data, emails: [] },
				currentStep: "finalization" as const,
				direction: "forward" as const,
			}
		})
	}, [setState, trackStepCompleted])

	// Ref to hold finalization context - avoids stale closures and reduces dependencies
	const finalizationContext = useRef({
		orgId: state.initialOrgId || state.data.createdOrgId,
		memberId: options.organizationMemberId,
		userId: user?.id,
		metadata: { role: state.data.role, useCases: state.data.useCases },
		emails: state.data.emails,
		userType: state.userType,
	})

	// Keep ref in sync with state
	useEffect(() => {
		finalizationContext.current = {
			orgId: state.initialOrgId || state.data.createdOrgId,
			memberId: options.organizationMemberId,
			userId: user?.id,
			metadata: { role: state.data.role, useCases: state.data.useCases },
			emails: state.data.emails,
			userType: state.userType,
		}
	}, [state.initialOrgId, state.data, options.organizationMemberId, user?.id, state.userType])

	// Finalization handler - stable callback with minimal dependencies
	const handleFinalization = useCallback(async () => {
		const ctx = finalizationContext.current
		setState((prev) => ({ ...prev, isProcessing: true, error: undefined }))

		try {
			// Critical: finalize onboarding first (sets isOnboarded=true on the user).
			// We no longer require an org at this point — Clerk handles org creation
			// during sign-up separately; the rest of the app can nudge the user to
			// create one later if needed.
			const finalizeResult = await finalizeOnboarding({
				payload: void 0,
				reactivityKeys: ["currentUser"],
			})

			if (!Exit.isSuccess(finalizeResult)) {
				throw new Error("Failed to finalize onboarding")
			}

			// Non-critical: save member metadata (don't fail if this fails)
			if (ctx.memberId && ctx.userId) {
				await updateMemberMetadata({
					payload: { id: ctx.memberId, metadata: ctx.metadata },
				}).catch(() => {
					// Silently ignore metadata save failures
				})
			}

			// Non-critical: send invitations via Clerk (only if we have an active Clerk org).
			if (clerkOrganization && ctx.emails.length > 0) {
				await Promise.allSettled(
					ctx.emails.map((email) =>
						clerkOrganization.inviteMember({ emailAddress: email, role: "org:member" }),
					),
				)
			}

			// Track onboarding completion
			posthog.capture("onboarding_completed", {
				user_type: ctx.userType,
				total_steps: getTotalSteps(ctx.userType),
			})

			// Update state - navigation is handled by component's useEffect
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
			}))
		}
	}, [finalizeOnboarding, updateMemberMetadata, clerkOrganization, setState, posthog])

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
