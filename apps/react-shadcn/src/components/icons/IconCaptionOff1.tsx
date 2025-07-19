// icons/svgs/contrast/media

import type React from "react"
import type { SVGProps } from "react"

export const IconCaptionOff1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M9.357 3C8.273 3 7.4 3 6.691 3.058c-.728.06-1.369.185-1.96.487A5 5 0 0 0 2.544 5.73c-.302.592-.428 1.233-.487 1.961C2 8.4 2 9.273 2 10.357v3.286c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 1.6 1.835 1 1 0 0 0 1.278-.114L19.991 5.423a1 1 0 0 0-.136-1.528 5 5 0 0 0-.585-.35c-.592-.302-1.232-.428-1.961-.487C16.6 3 15.727 3 14.643 3z"
				/>
				<path
					fill="currentColor"
					d="M21.988 8.644a1 1 0 0 0-1.707-.683L8.95 19.293A1 1 0 0 0 9.656 21h4.987c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.961-.487a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961C22 15.6 22 14.727 22 13.643V10.39c0-.662 0-1.241-.012-1.746Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10.25 9a3 3 0 0 0-3 3v.5a3 3 0 0 0 1.597 2.653m5.995-.338a3 3 0 0 0 1.908.685m4.238-6.832C21 9.16 21 9.73 21 10.4v3.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 20 16.84 20 14.6 20H9.656m-4.94-.716L2 22m2.716-2.716a4 4 0 0 1-1.28-1.468C3 16.96 3 15.84 3 13.6v-3.2c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C6.04 4 7.16 4 9.4 4h5.2c2.24 0 3.36 0 4.216.436q.245.125.468.28M4.716 19.284l4.131-4.131m0 0L19.284 4.716M22 2l-2.716 2.716"
			/>
		</svg>
	)
}

export default IconCaptionOff1
