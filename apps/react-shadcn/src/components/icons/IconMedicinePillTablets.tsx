// icons/svgs/solid/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconMedicinePillTablets: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M12.99 6.629 1.393 9.133A6.001 6.001 0 0 0 12.99 6.629Z" fill="currentColor" />
			<path d="M1.012 7.373A6.002 6.002 0 0 1 12.611 4.87z" fill="currentColor" />
			<path d="M11.739 14.117a6.001 6.001 0 0 1 11.143 4.078z" fill="currentColor" />
			<path d="M11.12 15.807a6.002 6.002 0 0 0 11.143 4.079z" fill="currentColor" />
		</svg>
	)
}

export default IconMedicinePillTablets
