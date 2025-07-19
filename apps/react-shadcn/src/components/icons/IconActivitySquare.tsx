// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconActivitySquare: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.963 2h.074c1.366 0 2.443 0 3.314.06.888.06 1.634.186 2.328.473a7 7 0 0 1 3.788 3.788c.287.694.413 1.44.474 2.328.059.87.059 1.948.059 3.314v.074c0 1.366 0 2.443-.06 3.314-.06.888-.186 1.634-.473 2.328a7 7 0 0 1-3.788 3.788c-.694.287-1.44.413-2.328.474-.87.059-1.948.059-3.314.059h-.074c-1.366 0-2.443 0-3.314-.06-.888-.06-1.634-.186-2.328-.473a7 7 0 0 1-3.788-3.788c-.287-.694-.413-1.44-.474-2.328C2 14.481 2 13.403 2 12.037v-.074c0-1.366 0-2.443.06-3.314.06-.888.186-1.634.473-2.328A7 7 0 0 1 6.32 2.533c.694-.287 1.44-.413 2.328-.474C9.519 2 10.597 2 11.963 2ZM10.93 6.629a1 1 0 0 0-1.857 0L7.323 11H5a1 1 0 0 0 0 2h3a1 1 0 0 0 .928-.629L10 9.693l3.072 7.678a1 1 0 0 0 1.857 0L16.677 13H19a1 1 0 0 0 0-2h-3a1 1 0 0 0-.928.629L14 14.307 10.928 6.63z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconActivitySquare
