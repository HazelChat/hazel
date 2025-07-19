// icons/svgs/stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconBlueskyStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 11.297c-.905-1.88-3.372-5.38-5.665-7.108C4.681 2.943 2 1.98 2 5.047c0 .612.35 5.147.556 5.884.713 2.56 3.315 3.212 5.629 2.817-4.045.69-5.074 2.978-2.852 5.266 4.22 4.344 6.066-1.09 6.539-2.483.128-.378.128-.378.256 0 .473 1.393 2.318 6.827 6.539 2.483 2.222-2.288 1.193-4.575-2.852-5.266 2.314.395 4.916-.258 5.63-2.817.205-.737.555-5.272.555-5.884 0-3.068-2.68-2.104-4.335-.858-2.293 1.727-4.76 5.229-5.665 7.108Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconBlueskyStroke
