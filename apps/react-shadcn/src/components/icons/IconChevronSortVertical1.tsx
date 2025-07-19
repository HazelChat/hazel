// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronSortVertical1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M12.298 5.106A20.4 20.4 0 0 1 16 9c-2.663-.2-5.337-.2-8 0a20.4 20.4 0 0 1 3.702-3.894.47.47 0 0 1 .596 0Z"
				/>
				<path
					fill="currentColor"
					d="M11.702 18.894A20.4 20.4 0 0 1 8 15c2.663.2 5.337.2 8 0a20.4 20.4 0 0 1-3.702 3.894.47.47 0 0 1-.596 0Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12.298 5.106A20.4 20.4 0 0 1 16 9c-2.663-.2-5.337-.2-8 0a20.4 20.4 0 0 1 3.702-3.894.47.47 0 0 1 .596 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.702 18.894A20.4 20.4 0 0 1 8 15c2.663.2 5.337.2 8 0a20.4 20.4 0 0 1-3.702 3.894.47.47 0 0 1-.596 0Z"
			/>
		</svg>
	)
}

export default IconChevronSortVertical1
