// icons/svgs/solid/security

import type React from "react"
import type { SVGProps } from "react"

export const IconEyeOff: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M22.707 2.707a1 1 0 0 0-1.414-1.414L17.265 5.32a.2.2 0 0 1-.244.032A10.06 10.06 0 0 0 12 4C8.933 4 6.446 5.396 4.745 7.029a11 11 0 0 0-1.988 2.55C2.307 10.394 2 11.257 2 12c0 .91.462 2.022 1.136 3.048.487.739 1.125 1.5 1.902 2.196a.203.203 0 0 1 .01.294l-3.755 3.755a1 1 0 1 0 1.414 1.414zm-8.858 6.03a.19.19 0 0 0-.043-.307 4 4 0 0 0-5.376 5.376.19.19 0 0 0 .306.043l1.25-1.25a.21.21 0 0 0 .055-.193 2 2 0 0 1 2.365-2.365.21.21 0 0 0 .194-.055z"
				clipRule="evenodd"
				fill="currentColor"
			/>
			<path
				d="m10.038 18.205 2.158-2.16a.2.2 0 0 1 .13-.058 4 4 0 0 0 3.66-3.661.2.2 0 0 1 .06-.13l3.325-3.325a1 1 0 0 1 1.548.166C21.561 10.035 22 11.112 22 12c0 .743-.307 1.606-.757 2.42a11 11 0 0 1-1.988 2.551C17.555 18.604 15.068 20 12 20a10 10 0 0 1-1.396-.098 1 1 0 0 1-.566-1.697Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconEyeOff
