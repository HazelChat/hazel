// icons/svgs/duo-solid/alerts

import type React from "react"
import type { SVGProps } from "react"

export const IconNotificationBellOffDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".35">
				<path
					fill="currentColor"
					d="M12 2a8.207 8.207 0 0 0-8.178 7.526l-.355 4.26c-.031.373-.15.735-.32 1.245a2.588 2.588 0 0 0 2.168 3.39q.529.06 1.058.108a1 1 0 0 0 .8-.288L18.621 6.793a1 1 0 0 0 .113-1.28A8.2 8.2 0 0 0 12 2Z"
				/>
				<path
					fill="currentColor"
					fillRule="evenodd"
					d="M20.195 9.713a1 1 0 0 0-1.704-.624l-9.704 9.704a1 1 0 0 0-.174 1.18 3.842 3.842 0 0 0 7.196-1.302q1.44-.09 2.876-.25a2.587 2.587 0 0 0 2.17-3.386c-.17-.512-.29-.873-.32-1.247zm-8.576 9.077q1.06.008 2.12-.024a1.843 1.843 0 0 1-2.91.814z"
					clipRule="evenodd"
				/>
			</g>
		</svg>
	)
}

export default IconNotificationBellOffDuoSolid
