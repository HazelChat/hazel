// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowTurnLeftUp1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 8.859a25.2 25.2 0 0 1 4.505-4.684.79.79 0 0 1 .99 0A25.2 25.2 0 0 1 14 8.859c-.935-.16-1.402-.241-1.87-.303a24 24 0 0 0-6.26 0c-.468.062-.935.142-1.87.303Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9 8.351V12c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C12.8 20 14.2 20 17 20h3M9 8.351a24 24 0 0 0-3.13.205c-.468.062-.935.142-1.87.303a25.2 25.2 0 0 1 4.505-4.684.79.79 0 0 1 .99 0A25.2 25.2 0 0 1 14 8.859c-.935-.16-1.402-.241-1.87-.303A24 24 0 0 0 9 8.351Z"
			/>
		</svg>
	)
}

export default IconArrowTurnLeftUp1
