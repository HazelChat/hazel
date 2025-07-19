// icons/svgs/solid/building

import type React from "react"
import type { SVGProps } from "react"

export const IconControlTower: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 1a1 1 0 0 1 1 1v1h6.13a2.5 2.5 0 0 1 2.469 2.896l-.029.146-1.159 5.217a3.5 3.5 0 0 1-2.364 2.575l.451 8.11.001.103a1 1 0 0 1-1.986.11l-.011-.101L16.055 14h-8.11l-.447 8.056a1 1 0 1 1-1.996-.112l.45-8.11a3.5 3.5 0 0 1-2.363-2.575l-1.16-5.217A2.5 2.5 0 0 1 4.87 3H11V2a1 1 0 0 1 1-1Zm-6.459 9.825A1.5 1.5 0 0 0 7.006 12H8.78l-.6-3H5.137zM10.819 12h2.362l.6-3H10.22zm4.4 0h1.775a1.5 1.5 0 0 0 1.465-1.175L18.864 9H15.82z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconControlTower
