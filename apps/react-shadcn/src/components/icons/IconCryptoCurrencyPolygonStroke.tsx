// icons/svgs/stroke/web3-&-crypto

import type React from "react"
import type { SVGProps } from "react"

export const IconCryptoCurrencyPolygonStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeMiterlimit="10"
				strokeWidth="2"
				d="M12 7.487v-.82L7.5 4 3 6.667V12l4.5 2.667 9-5.334L21 12v5.333L16.5 20 12 17.333v-.871"
				fill="none"
			/>
		</svg>
	)
}

export default IconCryptoCurrencyPolygonStroke
