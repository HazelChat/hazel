// icons/svgs/solid/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconWaterTripleDroplet: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.673 1.316a1 1 0 0 0-1.346 0C8.09 4.263 7.069 6.96 7.655 9.123c.576 2.128 2.597 3.266 4.345 3.266s3.769-1.138 4.345-3.266c.586-2.163-.436-4.86-3.672-7.807Zm-6 10.21a1 1 0 0 0-1.346 0c-3.236 2.947-4.258 5.644-3.672 7.807C2.23 21.46 4.252 22.599 6 22.599s3.769-1.138 4.345-3.266c.586-2.163-.436-4.86-3.672-7.807Zm10.654 0a1 1 0 0 1 1.346 0c3.236 2.947 4.258 5.644 3.672 7.807-.576 2.128-2.597 3.266-4.345 3.266s-3.77-1.138-4.345-3.266c-.586-2.163.436-4.86 3.672-7.807Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconWaterTripleDroplet
