import { AnimatePresence, motion } from "motion/react"
import type { ReactNode } from "react"
import { Logo } from "~/components/logo"
import { Link } from "~/components/ui/link"
import { getOnboardingImage } from "~/lib/helper/get-onboarding-image"

interface OnboardingLayoutProps {
	children: ReactNode
	currentStep?: number
	totalSteps?: number
	direction?: "forward" | "backward"
}

export function OnboardingLayout({
	children,
	currentStep,
	totalSteps,
	direction = "forward",
}: OnboardingLayoutProps) {
	const stepVariants = {
		enter: (direction: "forward" | "backward") => ({
			y: direction === "forward" ? 10 : -10,
			opacity: 0.1,
			filter: "blur(4px)",
		}),
		center: { y: 0, opacity: 1, filter: "blur(0px)" },
		exit: (direction: "forward" | "backward") => ({
			y: direction === "forward" ? -10 : 10,
			opacity: 0.1,
			filter: "blur(4px)",
		}),
	}

	return (
		<main className="relative grid h-dvh grid-cols-1 flex-col items-center justify-center overflow-y-auto lg:max-w-none lg:grid-cols-2 lg:overflow-hidden">
			{/* Left panel - branding and visual */}
			<div className="relative hidden h-full flex-col p-10 text-white lg:flex">
				<img
					src={getOnboardingImage()}
					alt="Onboarding background"
					className="absolute inset-0 size-full object-cover object-top-left"
					style={{ imageRendering: "pixelated" }}
				/>

				<Link
					href={{ to: "/" }}
					aria-label="Go to homepage"
					className="relative z-20 flex items-center gap-2"
				>
					<Logo className="size-8 text-white" />
					<strong className="font-semibold">Hazel</strong>
				</Link>

				<div className="relative z-20 mt-auto rounded-xl bg-black/60 p-6 ring ring-white/10 backdrop-blur-sm">
					<blockquote className="space-y-2">
						<p className="text-lg text-white">
							Welcome to your new workspace. Let's get you set up in just a few steps.
						</p>
						<div className="font-mono text-sm text-white/80">
							{currentStep && totalSteps ? (
								<>
									Step{" "}
									<AnimatePresence mode="wait" custom={direction}>
										<motion.span
											key={currentStep}
											custom={direction}
											variants={stepVariants}
											initial="enter"
											animate="center"
											exit="exit"
											transition={{ duration: 0.2 }}
											className="inline-block font-mono"
										>
											{currentStep}
										</motion.span>
									</AnimatePresence>{" "}
									of {totalSteps}
								</>
							) : (
								"Getting started"
							)}
						</div>
					</blockquote>
				</div>
			</div>

			{/* Right panel - content */}
			<div className="flex min-h-dvh flex-col overflow-y-auto p-3 pt-6 sm:p-4 md:p-12 lg:h-full lg:min-h-0">
				<div className="m-auto w-full max-w-2xl space-y-4 py-4 sm:space-y-6 sm:py-6">{children}</div>
			</div>
		</main>
	)
}
