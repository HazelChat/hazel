// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMaximizeFourArrow: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4.488 3.082a19.5 19.5 0 0 1 5.01.188 1 1 0 0 1 .481 1.75L8.75 6.06a23 23 0 0 0-2.69 2.69L5.02 9.98a1 1 0 0 1-1.75-.482 19.5 19.5 0 0 1-.188-5.01 1.555 1.555 0 0 1 1.406-1.406Z"
				fill="currentColor"
			/>
			<path
				d="M19.515 3.082a19.5 19.5 0 0 0-5.01.188 1 1 0 0 0-.481 1.75l1.229 1.04a23 23 0 0 1 2.69 2.69l1.04 1.23a1 1 0 0 0 1.75-.482 19.5 19.5 0 0 0 .189-5.01 1.555 1.555 0 0 0-1.407-1.406Z"
				fill="currentColor"
			/>
			<path
				d="M19.512 20.918c-1.662.154-3.346.09-5.01-.188a1 1 0 0 1-.482-1.75l1.23-1.04a23 23 0 0 0 2.69-2.69l1.04-1.23a1 1 0 0 1 1.75.482 19.5 19.5 0 0 1 .188 5.01 1.555 1.555 0 0 1-1.406 1.406Z"
				fill="currentColor"
			/>
			<path
				d="M4.485 20.918c1.661.154 3.345.09 5.01-.188a1 1 0 0 0 .481-1.75l-1.23-1.04a23 23 0 0 1-2.689-2.69l-1.04-1.23a1 1 0 0 0-1.75.482 19.5 19.5 0 0 0-.189 5.01 1.555 1.555 0 0 0 1.407 1.406Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMaximizeFourArrow
