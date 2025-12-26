"use client"

import { twMerge } from "tailwind-merge"
import { tv } from "tailwind-variants"

const formErrorSummaryStyles = tv({
	base: [
		"rounded-lg border p-4",
		"bg-danger-subtle/50 border-danger-subtle-fg/20",
		"text-danger-subtle-fg",
		"animate-[field-error-enter_0.2s_ease-out]",
	],
})

export interface FormError {
	/** Field name or label */
	field: string
	/** Error message */
	message: string
}

export interface FormErrorSummaryProps {
	/** Array of form errors to display */
	errors: FormError[]
	/** Optional title for the error summary */
	title?: string
	/** Additional CSS classes */
	className?: string
}

/**
 * Displays a summary of all form errors at the top of a form.
 * Useful for complex forms where users need to see all errors at a glance.
 *
 * @example
 * ```tsx
 * <form.Subscribe selector={(state) => state.errors}>
 *   {(errors) => (
 *     <FormErrorSummary
 *       errors={Object.entries(errors).map(([field, msgs]) => ({
 *         field,
 *         message: msgs[0]?.message ?? "Invalid"
 *       }))}
 *     />
 *   )}
 * </form.Subscribe>
 * ```
 */
export function FormErrorSummary({
	errors,
	title = "Please fix the following errors:",
	className,
}: FormErrorSummaryProps) {
	if (!errors.length) return null

	return (
		<div className={twMerge(formErrorSummaryStyles(), className)} role="alert" aria-live="polite">
			<p className="mb-2 font-medium text-sm">{title}</p>
			<ul className="list-inside list-disc space-y-1 text-sm">
				{errors.map((error, index) => (
					<li key={index}>
						<span className="font-medium">{error.field}:</span> {error.message}
					</li>
				))}
			</ul>
		</div>
	)
}
