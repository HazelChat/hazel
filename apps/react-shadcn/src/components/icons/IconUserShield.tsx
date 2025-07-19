// icons/svgs/solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserShield: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m17.473 17.434-.335.105c.082.18.202.351.359.503.154-.147.272-.314.355-.488z"
				fill="currentColor"
			/>
			<path
				d="M12.983 22a7.5 7.5 0 0 1-1.976-5.405l.027-.618A4 4 0 0 1 11.653 14H8a5 5 0 0 0-5 5 3 3 0 0 0 3 3z"
				fill="currentColor"
			/>
			<path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" fill="currentColor" />
			<path
				d="M21.94 15.992a2.09 2.09 0 0 0-1.468-1.8l-2.338-.74a2.2 2.2 0 0 0-1.323 0l-2.305.73c-.823.26-1.434.995-1.474 1.888l-.027.618c-.097 2.219 1.161 4.262 3.178 5.27l.327.163a2.2 2.2 0 0 0 1.913.019l.284-.136c2.157-1.023 3.478-3.215 3.272-5.56z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconUserShield
