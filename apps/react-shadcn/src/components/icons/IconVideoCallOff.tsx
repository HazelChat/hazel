// icons/svgs/solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconVideoCallOff: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M22.707 2.707a1 1 0 0 0-1.414-1.414l-20 20a1 1 0 1 0 1.414 1.414l2.738-2.737Q5.719 20 6 20h7a5 5 0 0 0 4.704-3.302l.366.307c1.952 1.64 4.93.252 4.93-2.297V9.292c0-2.195-2.208-3.529-4.068-2.81zm-4.706 11.208V10.08a1 1 0 0 1 .356-.714l1-.84A1 1 0 0 1 21 9.292v5.416a1 1 0 0 1-1.643.766l-1-.84a1 1 0 0 1-.356-.72Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M6 4a5 5 0 0 0-5 5v6a5 5 0 0 0 .217 1.462 1 1 0 0 0 1.664.415L14.037 5.72a1 1 0 0 0-.626-1.704A5 5 0 0 0 13 4z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconVideoCallOff
