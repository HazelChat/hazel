// icons/svgs/solid/food

import type React from "react"
import type { SVGProps } from "react"

export const IconCake: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M7 1a1 1 0 0 1 1 1v.01a1 1 0 0 1-2 0V2a1 1 0 0 1 1-1Z" fill="currentColor" />
			<path d="M12 1a1 1 0 0 1 1 1v.01a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1Z" fill="currentColor" />
			<path d="M17 1a1 1 0 0 1 1 1v.01a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1Z" fill="currentColor" />
			<path
				fillRule="evenodd"
				d="M7 4a1 1 0 0 1 1 1v2h3V5a1 1 0 1 1 2 0v2h3V5a1 1 0 1 1 2 0v2.026c.685.039 1.282.138 1.816.41a4 4 0 0 1 1.748 1.748c.247.485.346 1.002.392 1.564l.014.209c.03.5.03 1.097.03 1.802V19a1 1 0 1 1 0 2H2a1 1 0 1 1 0-2v-6.241c0-.805 0-1.47.044-2.01l.01-.106c.049-.521.15-1.004.382-1.459a4 4 0 0 1 1.76-1.754c.53-.267 1.124-.366 1.804-.404V5a1 1 0 0 1 1-1ZM4 15.784V19h16v-3.216a2.2 2.2 0 0 1-1.07-1.1.228.228 0 0 0-.416 0c-.786 1.755-3.279 1.755-4.065 0a.228.228 0 0 0-.416 0c-.787 1.755-3.28 1.755-4.066 0a.228.228 0 0 0-.416 0c-.786 1.755-3.279 1.755-4.065 0a.228.228 0 0 0-.416 0 2.2 2.2 0 0 1-1.07 1.1Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCake
