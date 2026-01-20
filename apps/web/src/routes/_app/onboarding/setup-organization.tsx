import { useAtomSet } from "@effect-atom/atom-react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router"
import { type } from "arktype"
import { Exit } from "effect"
import { setOrganizationSlugMutation } from "~/atoms/organization-atoms"
import { Button } from "~/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Description, FieldError, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Loader } from "~/components/ui/loader"
import { TextField } from "~/components/ui/text-field"
import { organizationCollection, organizationMemberCollection } from "~/db/collections"
import { useAppForm } from "~/hooks/use-app-form"
import { useAuth } from "~/lib/auth"
import { toastExitOnError } from "~/lib/toast-exit"

const searchSchema = type({
	"orgId?": "string",
})

export const Route = createFileRoute("/_app/onboarding/setup-organization")({
	component: RouteComponent,
	validateSearch: searchSchema,
})

// Sanitize slug value to URL-safe format
function sanitizeSlug(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.slice(0, 50)
}

// Define a custom slug validator
const slugValidator = (slug: string) => {
	if (slug.startsWith("-") || slug.endsWith("-")) {
		return false
	}
	return true
}

const orgSchema = type({
	name: "string > 0",
	slug: type("string >= 3").narrow(slugValidator),
})

type OrgFormData = typeof orgSchema.infer

function RouteComponent() {
	const { user } = useAuth()
	const navigate = useNavigate()
	const { orgId } = Route.useSearch()

	const setOrganizationSlug = useAtomSet(setOrganizationSlugMutation, { mode: "promiseExit" })

	// Fetch the organization to verify user has access and get the current name
	const {
		data: membership,
		isLoading,
		isReady,
	} = useLiveQuery(
		(q) => {
			if (!user?.id || !orgId) return undefined
			return q
				.from({ member: organizationMemberCollection })
				.innerJoin({ org: organizationCollection }, ({ member, org }) =>
					eq(member.organizationId, org.id),
				)
				.where(({ member, org }) => eq(member.userId, user.id) && eq(org.id, orgId))
				.findOne()
		},
		[user?.id, orgId],
	)

	const organization = membership?.org

	const form = useAppForm({
		defaultValues: {
			name: organization?.name || "",
			slug: organization?.slug || "",
		} as OrgFormData,
		validators: {
			onChange: orgSchema,
		},
		onSubmit: async ({ value }) => {
			if (!organization?.id) return

			const exit = await setOrganizationSlug({
				payload: { id: organization.id, slug: value.slug },
			})

			toastExitOnError(exit, {
				customErrors: {
					OrganizationSlugAlreadyExistsError: (error) => ({
						title: "Slug already taken",
						description: `The slug "${error.slug}" is already in use. Please choose a different one.`,
						isRetryable: false,
					}),
					OrganizationNotFoundError: () => ({
						title: "Organization not found",
						description: "This organization may have been deleted.",
						isRetryable: false,
					}),
				},
			})

			if (Exit.isSuccess(exit)) {
				navigate({ to: "/$orgSlug", params: { orgSlug: value.slug } })
			}
		},
	})

	// Update form values when organization data loads
	if (organization && !form.state.values.name && organization.name) {
		form.setFieldValue("name", organization.name)
	}

	if (isLoading || !isReady) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader className="size-8" />
			</div>
		)
	}

	// Redirect to main page if no orgId provided - it will handle finding the user's org
	if (!orgId) {
		return <Navigate to="/" />
	}

	if (!organization) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="font-semibold text-lg">Organization not found</h1>
					<p className="mt-2 text-muted-fg text-sm">
						You don't have access to this organization or it doesn't exist.
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-bg p-4">
			<div className="w-full max-w-md">
				<div className="space-y-6 rounded-xl border border-border bg-overlay p-6 shadow-lg">
					<CardHeader className="p-0">
						<CardTitle>Set up your workspace URL</CardTitle>
						<CardDescription>
							Choose a URL for your organization. This will be used to access your workspace.
						</CardDescription>
					</CardHeader>

					<form
						onSubmit={(e) => {
							e.preventDefault()
							form.handleSubmit()
						}}
					>
						<div className="space-y-4">
							<form.AppField
								name="name"
								children={(field) => (
									<TextField isRequired isDisabled>
										<Label>Organization name</Label>
										<Input
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											placeholder="Acme Inc."
										/>
										<Description>Your organization name</Description>
									</TextField>
								)}
							/>

							<form.AppField
								name="slug"
								children={(field) => (
									<>
										<TextField isRequired isInvalid={!!field.state.meta.errors?.length}>
											<Label>Workspace URL</Label>
											<div className="relative">
												<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
													<span className="text-muted-fg text-sm">hazel.app/</span>
													<Input
														data-testid="input-org-slug"
														value={field.state.value}
														onChange={(e) =>
															field.handleChange(sanitizeSlug(e.target.value))
														}
														onBlur={field.handleBlur}
														placeholder="acme"
														autoFocus
														aria-invalid={!!field.state.meta.errors?.length}
													/>
												</div>
											</div>
											{field.state.meta.errors?.[0] ? (
												<FieldError>{field.state.meta.errors[0].message}</FieldError>
											) : (
												<Description>
													Your unique workspace URL (lowercase letters, numbers, and
													hyphens)
												</Description>
											)}
										</TextField>

										{field.state.value &&
											field.state.value.length >= 3 &&
											!field.state.meta.errors?.length && (
												<div className="mt-3 rounded-lg border border-border bg-muted/30 p-4">
													<p className="text-muted-fg text-sm">
														Your workspace will be accessible at:{" "}
														<span className="font-medium text-fg">
															hazel.app/{field.state.value}
														</span>
													</p>
												</div>
											)}
									</>
								)}
							/>
						</div>

						<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
							{([canSubmit, isSubmitting]) => (
								<div className="mt-6">
									<Button
										type="submit"
										intent="primary"
										className="w-full"
										isDisabled={!canSubmit}
										isPending={isSubmitting}
									>
										{isSubmitting ? "Setting up..." : "Continue"}
									</Button>
								</div>
							)}
						</form.Subscribe>
					</form>
				</div>
			</div>
		</div>
	)
}
