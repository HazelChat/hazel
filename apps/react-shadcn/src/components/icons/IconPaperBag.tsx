// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPaperBag: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.66 3h4.68c.803 0 1.46 0 2.001.04.561.043 1.067.133 1.553.349a4.5 4.5 0 0 1 1.9 1.594c.298.441.474.923.613 1.469.134.525.248 1.173.388 1.964l.872 4.944c.221 1.252.398 2.256.47 3.07.074.834.05 1.577-.206 2.28a5 5 0 0 1-2.198 2.62c-.648.374-1.375.527-2.21.6-.814.07-1.833.07-3.104.07H9.582c-1.272 0-2.29 0-3.106-.07-.833-.073-1.561-.226-2.208-.6a5 5 0 0 1-2.199-2.62c-.255-.703-.28-1.446-.206-2.28.072-.814.249-1.818.47-3.07l.872-4.944c.14-.791.254-1.44.388-1.964.14-.546.316-1.028.613-1.469a4.5 4.5 0 0 1 1.9-1.594c.486-.216.992-.306 1.553-.348C8.2 3 8.857 3 9.661 3ZM10 8a1 1 0 0 0-2 0 4 4 0 0 0 8 0 1 1 0 1 0-2 0 2 2 0 1 1-4 0Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPaperBag
