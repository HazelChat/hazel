// icons/svgs/solid/time

import type React from "react"
import type { SVGProps } from "react"

export const IconCalendarRemove: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M8 1a1 1 0 0 1 1 1v1.04C9.805 3 10.759 3 11.916 3h.168c1.157 0 2.111 0 2.916.04V2a1 1 0 1 1 2 0v1.305q.35.092.679.228a7 7 0 0 1 3.788 3.788c.318.768.439 1.605.491 2.628.042.813.042 1.802.042 3.025v.063c0 1.366 0 2.443-.06 3.314-.06.888-.186 1.634-.473 2.328a7 7 0 0 1-3.788 3.788c-.694.287-1.44.413-2.328.474-.87.059-1.948.059-3.314.059h-.074c-1.366 0-2.443 0-3.314-.06-.888-.06-1.634-.186-2.328-.473a7 7 0 0 1-3.788-3.788c-.287-.694-.413-1.44-.474-2.328C2 15.481 2 14.404 2 13.037v-.063c0-1.223 0-2.212.042-3.025.052-1.023.173-1.86.49-2.628a7 7 0 0 1 3.79-3.788A5 5 0 0 1 7 3.305V2a1 1 0 0 1 1-1Zm1 12a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCalendarRemove
