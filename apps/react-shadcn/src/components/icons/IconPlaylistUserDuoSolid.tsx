// icons/svgs/duo-solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPlaylistUserDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7 3.001 17 3a1 1 0 1 0 0-2L7 1.001a1 1 0 0 0 0 2ZM5 5a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M17.04 9H6.96c-.666 0-1.226 0-1.683.037-.48.04-.934.124-1.366.345a3.5 3.5 0 0 0-1.53 1.529c-.22.432-.305.887-.344 1.366C2 12.734 2 13.294 2 13.959v4.081c0 .666 0 1.226.037 1.683.04.48.124.934.344 1.366a3.5 3.5 0 0 0 1.53 1.53c.432.22.887.305 1.366.344C5.734 23 6.294 23 6.96 23h10.08c.666 0 1.226 0 1.683-.037.48-.04.934-.125 1.366-.345a3.5 3.5 0 0 0 1.53-1.529c.22-.432.305-.887.344-1.366.037-.457.037-1.017.037-1.683v-4.08c0-.666 0-1.226-.037-1.683-.04-.48-.125-.934-.345-1.366a3.5 3.5 0 0 0-1.529-1.53c-.432-.22-.887-.305-1.366-.344C18.266 9 17.705 9 17.04 9ZM8.5 18.368a2.25 2.25 0 0 1 2.25-2.25h2.5a2.25 2.25 0 0 1 2.25 2.25c0 .898-.727 1.625-1.625 1.625h-3.75A1.625 1.625 0 0 1 8.5 18.368ZM12 11.47a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconPlaylistUserDuoSolid
