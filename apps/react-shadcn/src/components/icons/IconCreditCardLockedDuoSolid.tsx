// icons/svgs/duo-solid/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCreditCardLockedDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M8.357 3h7.286c1.084 0 1.958 0 2.666.058.729.06 1.369.185 1.961.487a5 5 0 0 1 2.185 2.185c.302.592.428 1.233.487 1.961C23 8.4 23 9.273 23 10.357v3.439C21.972 12.091 20.064 11 18 11c-2.702 0-5.137 1.869-5.68 4.54a5.2 5.2 0 0 0-1.206 2.273c-.185.789-.097 1.64-.048 2.109l.025.257c.018.206.043.497.1.821H8.356c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.961-.487a5 5 0 0 1-2.185-2.185c-.302-.592-.428-1.232-.487-1.961C1 15.6 1 14.727 1 13.643v-3.286c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.96A5 5 0 0 1 3.73 3.544c.592-.302 1.233-.428 1.961-.487C6.4 3 7.273 3 8.357 3Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M23 9a1 1 0 0 0-1-1H2a1 1 0 0 0 0 2h20a1 1 0 0 0 1-1Z" />
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M18 13c-2.001 0-3.707 1.523-3.789 3.518-.603.441-1 1.115-1.15 1.753-.103.438-.055.934-.003 1.471l.013.13.01.107c.043.46.083.886.233 1.258a2.83 2.83 0 0 0 1.89 1.66c.384.104.813.104 1.302.103h2.987c.49 0 .919.001 1.302-.103a2.83 2.83 0 0 0 1.89-1.66c.15-.372.19-.798.234-1.258l.01-.107.012-.13c.052-.537.1-1.033-.003-1.471a3.1 3.1 0 0 0-1.15-1.753C21.707 14.523 20.001 13 18 13Zm-1.64 3c.27-.574.88-1 1.64-1s1.37.426 1.64 1z"
				clipRule="evenodd"
			/>
			<path fill="currentColor" d="M5.85 12a1 1 0 1 0 0 2h3.3a1 1 0 1 0 0-2z" />
		</svg>
	)
}

export default IconCreditCardLockedDuoSolid
