// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPaintBrush1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="m13.123 6.906 7.27-3.848c.414-.22.862.229.643.643l-3.85 7.27A7.83 7.83 0 0 1 13 14.645c-.624-1.65-1.864-2.989-3.516-3.645a7.83 7.83 0 0 1 3.639-4.094Z"
				/>
				<path
					fill="currentColor"
					d="M4.776 15.272c1.025-1.245 2.858-1.324 4.074-.107 1.273 1.273.804 3.075-.129 4.29-1.708 2.224-5.3 2.022-6.721-.446a2.05 2.05 0 0 0 1.992-1.215c.15-.345.2-.695.25-1.04.074-.51.146-1.011.534-1.482Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8.85 15.165c-1.216-1.217-3.049-1.138-4.074.107-.652.79-.413 1.668-.784 2.522A2.05 2.05 0 0 1 2 19.01c1.42 2.468 5.013 2.67 6.721.446.933-1.215 1.402-3.017.13-4.29Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m20.393 3.058-7.27 3.848A7.83 7.83 0 0 0 9.484 11c1.652.656 2.892 1.994 3.516 3.645a7.83 7.83 0 0 0 4.187-3.674l3.849-7.27a.476.476 0 0 0-.643-.643Z"
			/>
		</svg>
	)
}

export default IconPaintBrush1
