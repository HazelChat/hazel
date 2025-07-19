// icons/svgs/duo-stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconTvDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 6.4c0-.84 0-1.26.163-1.581a1.5 1.5 0 0 1 .656-.656C3.139 4 3.559 4 4.4 4h15.2c.84 0 1.26 0 1.581.163a1.5 1.5 0 0 1 .656.656c.163.32.163.74.163 1.581v9.2c0 .84 0 1.26-.163 1.581a1.5 1.5 0 0 1-.656.656c-.32.163-.74.163-1.581.163H4.4c-.84 0-1.26 0-1.581-.163a1.5 1.5 0 0 1-.656-.656C2 16.861 2 16.441 2 15.6z"
				opacity=".28"
			/>
			<path fill="currentColor" d="m4.132 19-.964 1.445a1 1 0 0 0 1.664 1.11L6.535 19z" />
			<path fill="currentColor" d="m17.465 19 1.703 2.555a1 1 0 1 0 1.664-1.11L19.87 19h-2.404Z" />
		</svg>
	)
}

export default IconTvDuoStroke
