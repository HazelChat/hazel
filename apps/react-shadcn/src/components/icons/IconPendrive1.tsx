// icons/svgs/contrast/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconPendrive1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6 11.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C7.52 8 8.08 8 9.2 8h5.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C18 9.52 18 10.08 18 11.2V16c0 .929 0 1.393-.062 1.782a5 5 0 0 1-4.156 4.156C13.393 22 12.93 22 12 22s-1.393 0-1.782-.062a5 5 0 0 1-4.156-4.156C6 17.393 6 16.93 6 16z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 11.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C7.52 8 8.08 8 9.2 8h5.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C18 9.52 18 10.08 18 11.2V16c0 .929 0 1.393-.062 1.782a5 5 0 0 1-4.156 4.156C13.393 22 12.93 22 12 22s-1.393 0-1.782-.062a5 5 0 0 1-4.156-4.156C6 17.393 6 16.93 6 16z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 4.4c0-.84 0-1.26.163-1.581a1.5 1.5 0 0 1 .656-.656C9.139 2 9.559 2 10.4 2h3.2c.84 0 1.26 0 1.581.163a1.5 1.5 0 0 1 .656.656c.163.32.163.74.163 1.581V8H8z"
			/>
		</svg>
	)
}

export default IconPendrive1
