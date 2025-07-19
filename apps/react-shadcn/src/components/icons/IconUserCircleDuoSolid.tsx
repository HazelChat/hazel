// icons/svgs/duo-solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserCircleDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M19.386 17.144C18.598 15.85 17.135 15 15.5 15h-7c-1.634 0-3.097.85-3.886 2.144A8.99 8.99 0 0 0 12 21a8.99 8.99 0 0 0 7.386-3.856Z"
			/>
			<path fill="currentColor" d="M12 6.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
		</svg>
	)
}

export default IconUserCircleDuoSolid
