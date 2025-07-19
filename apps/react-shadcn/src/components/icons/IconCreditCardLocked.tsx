// icons/svgs/solid/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCreditCardLocked: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.357 3h7.286c1.084 0 1.958 0 2.666.058.729.06 1.369.185 1.961.487a5 5 0 0 1 2.185 2.185c.302.592.428 1.233.487 1.961q.012.15.021.309H1.037l.02-.309c.06-.728.186-1.369.488-1.96A5 5 0 0 1 3.73 3.544c.592-.302 1.233-.428 1.961-.487C6.4 3 7.273 3 8.357 3Z"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				d="M1 10v3.643c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 2.185 2.185c.592.302 1.233.428 1.961.487C6.4 21 7.273 21 8.357 21h2.833c-.056-.324-.081-.615-.1-.82l-.024-.258c-.049-.47-.137-1.32.048-2.109a5.2 5.2 0 0 1 1.207-2.273C12.863 12.869 15.298 11 18 11c2.064 0 3.972 1.09 5 2.796V10zm3.85 3a1 1 0 0 1 1-1h3.3a1 1 0 1 1 0 2h-3.3a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				d="M18 13c-2.001 0-3.707 1.523-3.789 3.518-.603.441-1 1.115-1.15 1.753-.103.438-.055.934-.003 1.471l.013.13.01.107c.043.46.083.886.233 1.258a2.83 2.83 0 0 0 1.89 1.66c.384.104.813.104 1.302.103h2.987c.49 0 .919.001 1.302-.103a2.83 2.83 0 0 0 1.89-1.66c.15-.372.19-.798.234-1.258l.01-.107.012-.13c.052-.537.1-1.033-.003-1.471a3.1 3.1 0 0 0-1.15-1.753C21.707 14.523 20.001 13 18 13Zm-1.64 3c.27-.574.88-1 1.64-1s1.37.426 1.64 1z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCreditCardLocked
