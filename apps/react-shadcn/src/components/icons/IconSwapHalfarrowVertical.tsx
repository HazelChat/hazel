// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconSwapHalfarrowVertical: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5.124 7.37a1 1 0 0 1 .072-1.078A21.2 21.2 0 0 1 8.979 2.36C9.276 2.121 9.638 2 10 2a1 1 0 0 1 1 1v15a1 1 0 1 1-2 0V7.678q-.351.015-.703.041l-2.223.165a1 1 0 0 1-.95-.514Z"
				fill="currentColor"
			/>
			<path
				d="M18.804 17.708a1 1 0 0 0-.878-1.592l-2.223.165q-.351.026-.703.041V6a1 1 0 1 0-2 0v15a1 1 0 0 0 1 1c.363 0 .724-.121 1.021-.36a21.2 21.2 0 0 0 3.783-3.932Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSwapHalfarrowVertical
