// icons/svgs/duo-stroke/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconHardriveDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17 12H7c-.465 0-.697 0-.892.022a3.5 3.5 0 0 0-2.89 2.262c.306-1.261.895-3.165 1.495-5.263.548-1.917.822-2.876 1.308-3.493a3.8 3.8 0 0 1 1.632-1.231C8.38 4 9.315 4 11.183 4h1.922c1.753 0 2.63 0 3.363.303a4 4 0 0 1 1.64 1.255c.485.628.715 1.474 1.174 3.165l1.54 5.677a3.5 3.5 0 0 0-2.93-2.378C17.696 12 17.464 12 17 12Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17 16h-4m-6-4h10c.464 0 .697 0 .892.022a3.5 3.5 0 0 1 3.086 3.086c.022.195.022.428.022.892s0 .697-.022.892a3.5 3.5 0 0 1-3.086 3.086C17.697 20 17.464 20 17 20H7c-.464 0-.697 0-.892-.022a3.5 3.5 0 0 1-3.086-3.086C3 16.697 3 16.464 3 16s0-.697.022-.892a3.5 3.5 0 0 1 3.086-3.086C6.303 12 6.536 12 7 12Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconHardriveDuoStroke
