// icons/svgs/duo-solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconSketchDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3.962 3.26A3 3 0 0 1 6.409 2h11.182c.971 0 1.883.47 2.447 1.26l2.902 4.067a3.005 3.005 0 0 1-.164 3.705l-8.492 9.917A3 3 0 0 1 12 22c-.84 0-1.684-.35-2.284-1.051l-8.493-9.917a3.01 3.01 0 0 1-.163-3.705z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m6.48 9.025 4.142 9.418L12 21l1.378-2.557 4.142-9.418m-11.04 0h11.04m-11.04 0H1.5m4.98 0L12 3l5.52 6.025m0 0h4.98"
			/>
		</svg>
	)
}

export default IconSketchDuoSolid
