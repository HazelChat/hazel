// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowTurnLeftDown: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20 3a1 1 0 1 1 0 2h-3c-1.417 0-2.419 0-3.203.065-.772.063-1.243.182-1.613.371a4 4 0 0 0-1.748 1.748c-.189.37-.308.842-.371 1.613C10 9.581 10 10.583 10 12v2.627q1.003-.044 2-.175c.443-.058.889-.134 1.83-.296a1 1 0 0 1 .974 1.58 26.2 26.2 0 0 1-4.684 4.87 1.79 1.79 0 0 1-2.24 0 26.2 26.2 0 0 1-4.684-4.87 1 1 0 0 1 .973-1.58c.942.162 1.388.238 1.831.296q.997.132 2 .175v-2.67c0-1.364 0-2.448.071-3.322.074-.896.227-1.66.583-2.359a6 6 0 0 1 2.622-2.622c.7-.356 1.463-.51 2.359-.583C14.509 3 15.593 3 16.956 3z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowTurnLeftDown
