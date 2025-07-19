// icons/svgs/contrast/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserLoveHeart1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				<path fill="currentColor" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
				<path
					fill="currentColor"
					d="M17 21.32c.4 0 4-1.945 4-4.667 0-1.361-1.2-2.316-2.4-2.333-.6-.009-1.2.194-1.6.777-.4-.583-1.01-.777-1.6-.777-1.2 0-2.4.972-2.4 2.333 0 2.722 3.6 4.666 4 4.666Z"
				/>
				<path
					fill="currentColor"
					d="M8 15h2.188v.237A5.3 5.3 0 0 0 10 16.653c0 1.508.544 2.777 1.227 3.779V21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10.402 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h1.215M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm1 14.32c-.4 0-4-1.945-4-4.667 0-1.361 1.2-2.333 2.4-2.333.59 0 1.2.194 1.6.777.4-.583 1-.786 1.6-.777 1.2.016 2.4.972 2.4 2.333 0 2.722-3.6 4.666-4 4.666Z"
			/>
		</svg>
	)
}

export default IconUserLoveHeart1
