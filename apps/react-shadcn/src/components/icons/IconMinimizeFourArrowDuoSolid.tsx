// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMinimizeFourArrowDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M3.835 10.063c1.665.279 3.349.342 5.01.189a1.555 1.555 0 0 0 1.407-1.407c.153-1.661.09-3.345-.189-5.01a1 1 0 0 0-1.75-.481l-1.04 1.229a23 23 0 0 1-2.69 2.69l-1.23 1.04a1 1 0 0 0 .482 1.75Z"
				/>
				<path
					fill="currentColor"
					d="M20.165 13.937a19.5 19.5 0 0 0-5.01-.189 1.555 1.555 0 0 0-1.407 1.407 19.5 19.5 0 0 0 .189 5.01 1 1 0 0 0 1.75.481l1.04-1.23a23 23 0 0 1 2.69-2.689l1.23-1.04a1 1 0 0 0-.482-1.75Z"
				/>
			</g>
			<path
				fill="currentColor"
				d="M20.168 10.063a19.5 19.5 0 0 1-5.01.189 1.555 1.555 0 0 1-1.406-1.407 19.5 19.5 0 0 1 .188-5.01 1 1 0 0 1 1.75-.481l1.04 1.229c.821.97 1.72 1.87 2.69 2.69l1.23 1.04a1 1 0 0 1-.482 1.75Z"
			/>
			<path
				fill="currentColor"
				d="M3.831 13.937a19.5 19.5 0 0 1 5.01-.189 1.555 1.555 0 0 1 1.407 1.407c.154 1.661.09 3.345-.188 5.01a1 1 0 0 1-1.75.481l-1.04-1.23a23 23 0 0 0-2.69-2.689l-1.23-1.04a1 1 0 0 1 .481-1.75Z"
			/>
		</svg>
	)
}

export default IconMinimizeFourArrowDuoSolid
