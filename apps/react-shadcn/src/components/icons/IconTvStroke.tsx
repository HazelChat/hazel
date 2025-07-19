// icons/svgs/stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconTvStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m20 21-2-3M4 21l2-3m-1.6 0h15.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581V6.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C20.861 4 20.441 4 19.6 4H4.4c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656C2 5.139 2 5.559 2 6.4v9.2c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.656c.32.163.74.163 1.581.163Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconTvStroke
