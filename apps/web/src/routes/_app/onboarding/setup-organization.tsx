import { useAtomSet } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router"
import { Exit } from "effect"
import { useState } from "react"
import { setOrganizationSlugMutation } from "~/atoms/organization-atoms"
import { InviteTeamStep } from "~/components/onboarding/invite-team-step"
import { OnboardingLayout } from "~/components/onboarding/onboarding-layout"
import { OrgSetupStep } from "~/components/onboarding/org-setup-step"
import { RoleStep } from "~/components/onboarding/role-step"
import { UseCaseStep } from "~/components/onboarding/use-case-step"
import { WelcomeStep } from "~/components/onboarding/welcome-step"
import { organizationCollection } from "~/db/collections"

export const Route = createFileRoute("/_app/onboarding/setup-organization")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => ({
		orgId: search.orgId as string | undefined,
	}),
})

type OnboardingStep = "welcome" | "org-setup" | "use-case" | "role" | "invite-team" | "completing"

function RouteComponent() {
	const { orgId } = Route.useSearch()
	const navigate = useNavigate()

	const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")
	const [orgSlug, setOrgSlug] = useState<string | undefined>()
	const [useCases, setUseCases] = useState<string[]>([])
	const [role, setRole] = useState<string | undefined>()

	const setOrganizationSlugAction = useAtomSet(setOrganizationSlugMutation, { mode: "promiseExit" })
	// const updateOrganization = useAtomSet(updateOrganizationMutation, { mode: "promiseExit" })
	// const createChannel = useAtomSet(createChannelMutation, { mode: "promiseExit" })

	// Fetch organization if orgId is provided
	const { data: organizations } = useLiveQuery(
		(q) =>
			q
				.from({ org: organizationCollection })
				.where(({ org }) => eq(org.id, orgId || ""))
				.orderBy(({ org }) => org.createdAt, "desc")
				.limit(1),
		[orgId],
	)

	const organization = organizations?.[0]

	// Determine if this is a creator (org has no slug yet) or invited user (org has slug)
	const isCreator = !organization?.slug

	// Auto-redirect if organization already has a slug (shouldn't happen but just in case)
	if (organization?.slug) {
		return <Navigate to="/$orgSlug" params={{ orgSlug: organization.slug }} />
	}

	const getTotalSteps = () => (isCreator ? 5 : 3)
	const getCurrentStepNumber = () => {
		const stepOrder: OnboardingStep[] = isCreator
			? ["welcome", "org-setup", "use-case", "role", "invite-team"]
			: ["welcome", "use-case", "role"]
		return stepOrder.indexOf(currentStep) + 1
	}

	const handleWelcomeContinue = () => {
		setCurrentStep(isCreator ? "org-setup" : "use-case")
	}

	const handleOrgSetupContinue = async (data: { name: string; slug: string }) => {
		if (!orgId) {
			throw new Error("Organization ID is required")
		}

		const result = await setOrganizationSlugAction({
			payload: {
				id: orgId as OrganizationId,
				slug: data.slug,
			},
		})

		if (Exit.isSuccess(result)) {
			setOrgSlug(data.slug)
			setCurrentStep("use-case")
		} else {
			// Handle error - it will be shown in the component
			throw new Error("Failed to set organization slug")
		}
	}

	const handleUseCaseContinue = (selectedUseCases: string[]) => {
		setUseCases(selectedUseCases)
		setCurrentStep("role")
	}

	const handleRoleContinue = async (selectedRole: string) => {
		setRole(selectedRole)

		// For invited users, save preferences and redirect immediately
		if (!isCreator) {
			setCurrentStep("completing")
			await handleCompletion(selectedRole, [])
		} else {
			// For creators, move to invite team step
			setCurrentStep("invite-team")
		}
	}

	const handleInviteTeamContinue = async (emails: string[]) => {
		setCurrentStep("completing")
		await handleCompletion(role!, emails)
	}

	const handleInviteTeamSkip = () => {
		setCurrentStep("completing")
		handleCompletion(role!, [])
	}

	const handleCompletion = async (_selectedRole: string, inviteEmails: string[]) => {
		if (!orgId) {
			throw new Error("Organization ID is required")
		}

		try {
			// TODO: Save user preferences to organization settings
			// await updateOrganization({
			// 	payload: {
			// 		id: orgId as OrganizationId,
			// 		settings: {
			// 			onboarding: {
			// 				useCases,
			// 				role: selectedRole,
			// 				completedAt: new Date().toISOString(),
			// 			},
			// 		},
			// 	},
			// })

			// TODO: For creators, create default channels (#general, #announcements)
			// This requires implementing channel creation RPC or backend logic

			// TODO: Send team invites
			// This would require a backend RPC endpoint or WorkOS API integration
			if (inviteEmails.length > 0) {
				console.log("TODO: Send invites to:", inviteEmails)
			}

			// Determine the slug to use for navigation
			const slugToUse = orgSlug || organization?.slug

			// Redirect to the organization
			if (slugToUse) {
				navigate({
					to: "/$orgSlug",
					params: { orgSlug: slugToUse },
				})
			} else {
				// If no slug is available, this is an error state
				// For invited users, the org should already have a slug
				// For creators, they should have just set it in the org-setup step
				console.error("No organization slug available for redirect")
				throw new Error("Organization slug is missing. Please try again.")
			}
		} catch (error) {
			console.error("Failed to complete onboarding:", error)
			// TODO: Show error toast
			// For now, stay on the completing screen to avoid redirect loop
			setCurrentStep("role")
		}
	}

	return (
		<OnboardingLayout currentStep={getCurrentStepNumber()} totalSteps={getTotalSteps()}>
			{currentStep === "welcome" && (
				<WelcomeStep
					onContinue={handleWelcomeContinue}
					isCreatingOrg={isCreator}
					organizationName={organization?.name}
				/>
			)}

			{currentStep === "org-setup" && isCreator && (
				<OrgSetupStep
					onBack={() => setCurrentStep("welcome")}
					onContinue={handleOrgSetupContinue}
					defaultName={organization?.name}
					defaultSlug={organization?.slug || ""}
				/>
			)}

			{currentStep === "use-case" && (
				<UseCaseStep
					onBack={() => setCurrentStep(isCreator ? "org-setup" : "welcome")}
					onContinue={handleUseCaseContinue}
					defaultSelection={useCases}
				/>
			)}

			{currentStep === "role" && (
				<RoleStep
					onBack={() => setCurrentStep("use-case")}
					onContinue={handleRoleContinue}
					defaultSelection={role}
				/>
			)}

			{currentStep === "invite-team" && isCreator && (
				<InviteTeamStep
					onBack={() => setCurrentStep("role")}
					onContinue={handleInviteTeamContinue}
					onSkip={handleInviteTeamSkip}
				/>
			)}

			{currentStep === "completing" && (
				<div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
					<div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="font-medium text-lg">Setting up your workspace...</p>
					<p className="text-muted-fg text-sm">This will just take a moment</p>
				</div>
			)}
		</OnboardingLayout>
	)
}
