// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconExchange01DuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18 17.532V7a3 3 0 1 0-6 0v10a3 3 0 1 1-6 0V6.468"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M6 3c-.423 0-.847.14-1.197.419a15.7 15.7 0 0 0-2.591 2.614 1 1 0 0 0 .887 1.61l.626-.062a23 23 0 0 1 4.55 0l.626.062a1 1 0 0 0 .887-1.61 15.7 15.7 0 0 0-2.59-2.614A1.92 1.92 0 0 0 6 3Z"
			/>
			<path
				fill="currentColor"
				d="M15.099 16.357a1 1 0 0 0-.887 1.61 15.7 15.7 0 0 0 2.59 2.614 1.92 1.92 0 0 0 2.395 0 15.7 15.7 0 0 0 2.591-2.614 1 1 0 0 0-.887-1.61l-.626.062a23 23 0 0 1-4.55 0z"
			/>
		</svg>
	)
}

export default IconExchange01DuoSolid
