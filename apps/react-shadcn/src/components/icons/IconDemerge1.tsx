// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconDemerge1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M4.647 4.086a20.6 20.6 0 0 1 5.296.2 53 53 0 0 0-5.657 5.657 20.6 20.6 0 0 1-.2-5.296.62.62 0 0 1 .56-.56Z"
				/>
				<path
					fill="currentColor"
					d="M14.057 4.286a20.6 20.6 0 0 1 5.296-.2.62.62 0 0 1 .56.56 20.6 20.6 0 0 1-.199 5.297 53 53 0 0 0-5.657-5.657Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.007 7.007 12 12v8M7.007 7.007a53 53 0 0 1 2.936-2.721 20.6 20.6 0 0 0-5.296-.2.62.62 0 0 0-.56.56 20.6 20.6 0 0 0 .199 5.297 53 53 0 0 1 2.721-2.936Zm9.986 0L15 9m1.993-1.993a53 53 0 0 0-2.936-2.721 20.6 20.6 0 0 1 5.296-.2.62.62 0 0 1 .56.56 20.6 20.6 0 0 1-.199 5.297 53 53 0 0 0-2.721-2.936Z"
			/>
		</svg>
	)
}

export default IconDemerge1
