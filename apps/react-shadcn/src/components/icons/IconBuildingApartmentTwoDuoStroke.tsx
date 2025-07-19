// icons/svgs/duo-stroke/building

import type React from "react"
import type { SVGProps } from "react"

export const IconBuildingApartmentTwoDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.4 22c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C14 21.24 14 20.96 14 20.4V10m-1.6 12h7c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C21 21.24 21 20.96 21 20.4v-7.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C19.48 10 18.92 10 17.8 10H14m-1.6 12H4.6c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437C3 21.24 3 20.96 3 20.4V5.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C4.52 2 5.08 2 6.2 2h4.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C14 3.52 14 4.08 14 5.2V10"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17 14h1m-1 4h1M7 6h3m-3 4h3m-3 4h3m-3 4h3"
				fill="none"
			/>
		</svg>
	)
}

export default IconBuildingApartmentTwoDuoStroke
