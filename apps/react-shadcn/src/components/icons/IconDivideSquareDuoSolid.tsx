// icons/svgs/duo-solid/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconDivideSquareDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.963 2c-1.366 0-2.443 0-3.314.06-.888.06-1.634.186-2.328.473A7 7 0 0 0 2.533 6.32c-.287.694-.413 1.44-.474 2.328C2 9.519 2 10.597 2 11.963v.074c0 1.366 0 2.443.06 3.314.06.888.186 1.634.473 2.328a7 7 0 0 0 3.788 3.788c.694.287 1.44.413 2.328.474.87.059 1.948.059 3.314.059h.074c1.366 0 2.443 0 3.314-.06.888-.06 1.634-.186 2.328-.473a7 7 0 0 0 3.788-3.788c.287-.694.413-1.44.474-2.328.059-.87.059-1.948.059-3.314v-.074c0-1.366 0-2.443-.06-3.314-.06-.888-.186-1.634-.473-2.328a7 7 0 0 0-3.788-3.788c-.694-.287-1.44-.413-2.328-.474C14.481 2 13.403 2 12.037 2z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M12 6.95a1.05 1.05 0 1 0 0 2.1h.001a1.05 1.05 0 1 0 0-2.1z" />
			<path fill="currentColor" d="M12 14.95a1.05 1.05 0 1 0 0 2.1h.001a1.05 1.05 0 1 0 0-2.1z" />
			<path fill="currentColor" d="M7.9 11a1 1 0 1 0 0 2h8.2a1 1 0 0 0 0-2z" />
		</svg>
	)
}

export default IconDivideSquareDuoSolid
