// icons/svgs/duo-stroke/building

import type React from "react"
import type { SVGProps } from "react"

export const IconBuildingApartmentOneDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.8 2H9.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C6 3.52 6 4.08 6 5.2v15.2c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C6.76 22 7.04 22 7.6 22h7.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C17 21.24 17 20.96 17 20.4V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C15.48 2 14.92 2 13.8 2Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10 6h3m-3 4h3m-3 4h3m-3 4h3"
				fill="none"
			/>
		</svg>
	)
}

export default IconBuildingApartmentOneDuoStroke
