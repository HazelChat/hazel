// icons/svgs/duo-solid/time

import type React from "react"
import type { SVGProps } from "react"

export const IconTimerOffDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M10 1a1 1 0 0 0 0 2h1v2.055A9 9 0 0 0 4.611 19.14a1 1 0 0 0 1.528.135L17.275 8.14a1 1 0 0 0-.135-1.528A8.96 8.96 0 0 0 13 5.055V3h1a1 1 0 1 0 0-2z"
				/>
				<path
					fill="currentColor"
					d="M20.08 10.03a1 1 0 0 0-1.605-.265l-10.71 10.71a1 1 0 0 0 .265 1.604A9 9 0 0 0 20.08 10.03Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M22 2 2 22"
			/>
		</svg>
	)
}

export default IconTimerOffDuoSolid
