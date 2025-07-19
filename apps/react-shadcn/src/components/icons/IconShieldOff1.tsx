// icons/svgs/contrast/security

import type React from "react"
import type { SVGProps } from "react"

export const IconShieldOff1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M10.883 2.368 5.495 4.314A3 3 0 0 0 3.516 7.02l-.127 3.309a11 11 0 0 0 2.668 7.614l13.15-13.15a3 3 0 0 0-.821-.451L12.92 2.368a3 3 0 0 0-2.038 0Z"
				/>
				<path
					fill="currentColor"
					d="M20.874 8.198a1 1 0 0 1 .65.861l.058.748a12 12 0 0 1-6.25 11.472l-1.488.806a4 4 0 0 1-3.886-.042l-1.251-.713a1 1 0 0 1-.212-1.576L19.82 8.429a1 1 0 0 1 1.054-.231Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6.057 17.943 2 22m4.057-4.057a11 11 0 0 1-2.667-7.615l.127-3.308a3 3 0 0 1 1.979-2.707l5.387-1.945a3 3 0 0 1 2.038 0l5.465 1.974c.3.108.577.262.82.451M6.058 17.943l13.15-13.15M22 2l-2.793 2.793m1.321 4.343.058.748A11 11 0 0 1 14.857 20.4l-1.489.806a3 3 0 0 1-2.914-.032l-1.251-.713"
			/>
		</svg>
	)
}

export default IconShieldOff1
