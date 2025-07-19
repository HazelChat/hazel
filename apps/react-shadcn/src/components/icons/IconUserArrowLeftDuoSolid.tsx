// icons/svgs/duo-solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserArrowLeftDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 18a3.7 3.7 0 0 1 .827-2.332q.715-.883 1.535-1.668H8a5 5 0 0 0-5 5 3 3 0 0 0 3 3h8.362a18 18 0 0 1-1.535-1.668A3.7 3.7 0 0 1 12 18Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M7 7a5 5 0 1 1 10 0A5 5 0 0 1 7 7Z" />
			<path
				fill="currentColor"
				d="M14.38 16.927a1.7 1.7 0 0 0 0 2.146 16 16 0 0 0 2.832 2.727 1 1 0 1 0 1.2-1.6q-.74-.555-1.398-1.2H22a1 1 0 1 0 0-2h-4.986q.658-.645 1.398-1.2a1 1 0 1 0-1.2-1.6 16 16 0 0 0-2.831 2.727Z"
			/>
		</svg>
	)
}

export default IconUserArrowLeftDuoSolid
