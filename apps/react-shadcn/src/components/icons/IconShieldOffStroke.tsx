// icons/svgs/stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconShieldOffStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6.057 17.943 2 22m4.057-4.057a11 11 0 0 1-2.667-7.615l.127-3.308a3 3 0 0 1 1.979-2.707l5.387-1.945a3 3 0 0 1 2.038 0l5.465 1.974c.3.108.577.262.82.451M6.058 17.943l13.15-13.15M22 2l-2.793 2.793m1.321 4.343.058.748A11 11 0 0 1 14.857 20.4l-1.489.806a3 3 0 0 1-2.914-.032l-1.251-.713"
				fill="none"
			/>
		</svg>
	)
}

export default IconShieldOffStroke
