// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconExchange021: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M12.145 8.604A20.6 20.6 0 0 1 16.031 5l-.165 2.2a24 24 0 0 0 0 3.6l.165 2.2a20.6 20.6 0 0 1-3.886-3.604.62.62 0 0 1 0-.792Z"
				/>
				<path
					fill="currentColor"
					d="M7.97 11a20.6 20.6 0 0 1 3.885 3.604.62.62 0 0 1 0 .792A20.6 20.6 0 0 1 7.97 19l.166-2.2a24 24 0 0 0 0-3.6z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15.798 9H20m-4.202 0q0-.9.067-1.8l.166-2.2a20.6 20.6 0 0 0-3.886 3.604.62.62 0 0 0 0 .792A20.6 20.6 0 0 0 16.03 13l-.166-2.2q-.067-.9-.067-1.8Zm-7.596 6H4m4.202 0q0-.9-.067-1.8L7.969 11a20.6 20.6 0 0 1 3.886 3.604.62.62 0 0 1 0 .792A20.6 20.6 0 0 1 7.97 19l.166-2.2q.067-.9.067-1.8Z"
			/>
		</svg>
	)
}

export default IconExchange021
