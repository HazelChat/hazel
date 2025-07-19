// icons/svgs/duo-solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconSlackDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path
					fill="currentColor"
					d="M8.5 1a2.5 2.5 0 0 0 0 5H9a2 2 0 0 0 2-2v-.5A2.5 2.5 0 0 0 8.5 1Z"
				/>
				<path
					fill="currentColor"
					d="M20.5 6A2.5 2.5 0 0 0 18 8.5V9a2 2 0 0 0 2 2h.5a2.5 2.5 0 1 0 0-5Z"
				/>
				<path
					fill="currentColor"
					d="M1 15.5A2.5 2.5 0 0 1 3.5 13H4a2 2 0 0 1 2 2v.5a2.5 2.5 0 1 1-5 0Z"
				/>
				<path fill="currentColor" d="M15 18a2 2 0 0 0-2 2v.5a2.5 2.5 0 1 0 2.5-2.5z" />
			</g>
			<path
				fill="currentColor"
				d="M14.5 1A2.5 2.5 0 0 0 12 3.5v5a2.5 2.5 0 1 0 5 0v-5A2.5 2.5 0 0 0 14.5 1Z"
			/>
			<path
				fill="currentColor"
				d="M9.5 13A2.5 2.5 0 0 0 7 15.5v5a2.5 2.5 0 1 0 5 0v-5A2.5 2.5 0 0 0 9.5 13Z"
			/>
			<path
				fill="currentColor"
				d="M13 14.5a2.5 2.5 0 0 1 2.5-2.5h5a2.5 2.5 0 0 1 0 5h-5a2.5 2.5 0 0 1-2.5-2.5Z"
			/>
			<path fill="currentColor" d="M3.5 7a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 1 0 0-5z" />
		</svg>
	)
}

export default IconSlackDuoSolid
