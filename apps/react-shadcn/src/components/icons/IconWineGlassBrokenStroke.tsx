// icons/svgs/stroke/food

import type React from "react"
import type { SVGProps } from "react"

export const IconWineGlassBrokenStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 13c3.6 0 6-2.736 6-6.111A10 10 0 0 0 16.698 2h-6.205M12 13c-3.6 0-6-2.736-6-6.111C6 5.154 6.487 3.42 7.302 2h3.191M12 13v9m0 0h4m-4 0H8m3.13-13.994c-.63-.615-.997-1.406-1.138-2.268l1.714-1.155A6.2 6.2 0 0 0 10.493 2"
				fill="none"
			/>
		</svg>
	)
}

export default IconWineGlassBrokenStroke
