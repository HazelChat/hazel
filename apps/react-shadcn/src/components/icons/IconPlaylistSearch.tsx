// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPlaylistSearch: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7 3.001 17 3a1 1 0 1 0 0-2L7 1.001a1 1 0 0 0 0 2ZM5 5a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2zm1.96 4h10.08c.666 0 1.226 0 1.683.037.48.04.934.124 1.366.345a3.5 3.5 0 0 1 1.53 1.529c.22.432.305.887.344 1.366.037.457.037 1.017.037 1.683v4.08c0 .666 0 1.226-.037 1.683-.04.48-.124.934-.345 1.366a3.5 3.5 0 0 1-1.529 1.53c-.432.22-.887.305-1.366.344-.457.037-1.017.037-1.683.037H6.96c-.666 0-1.226 0-1.683-.037-.48-.04-.934-.124-1.366-.345a3.5 3.5 0 0 1-1.53-1.529c-.22-.432-.304-.887-.344-1.366C2 19.266 2 18.706 2 18.04v-4.08c0-.666 0-1.226.037-1.683.04-.48.124-.934.344-1.366a3.5 3.5 0 0 1 1.53-1.53c.432-.22.887-.305 1.366-.344C5.734 9 6.294 9 6.96 9Zm2.933 6.662a1.663 1.663 0 1 1 3.326 0 1.663 1.663 0 0 1-3.326 0ZM11.556 12a3.664 3.664 0 1 0 1.785 6.863L14.4 19.92a1 1 0 0 0 1.414-1.414l-1.059-1.059a3.662 3.662 0 0 0-3.2-5.448z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPlaylistSearch
