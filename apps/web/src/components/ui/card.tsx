import type { HTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "danger"
}

const Card = ({ className, variant = "default", ...props }: CardProps) => {
	return (
		<div
			className={twMerge(
				"overflow-hidden rounded-xl border shadow-sm",
				variant === "danger" ? "border-danger/20 bg-danger/5" : "border-border bg-bg",
				className,
			)}
			{...props}
		/>
	)
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = ({ className, ...props }: CardHeaderProps) => {
	return (
		<div
			className={twMerge("border-border border-b bg-bg-muted/30 px-4 py-5 md:px-6", className)}
			{...props}
		/>
	)
}

interface CardHeaderGroupProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeaderGroup = ({ className, ...props }: CardHeaderGroupProps) => {
	return <div className={twMerge("flex flex-col items-start gap-4 md:flex-row", className)} {...props} />
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

const CardBody = ({ className, ...props }: CardBodyProps) => {
	return <div className={twMerge("p-4 md:p-6", className)} {...props} />
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = ({ className, ...props }: CardTitleProps) => {
	return (
		<h2 className={twMerge("font-semibold text-2xl leading-none tracking-tight", className)} {...props} />
	)
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = ({ className, ...props }: CardDescriptionProps) => {
	return <p className={twMerge("text-muted-fg text-sm", className)} {...props} />
}

export { Card, CardHeader, CardHeaderGroup, CardBody, CardTitle, CardDescription }
