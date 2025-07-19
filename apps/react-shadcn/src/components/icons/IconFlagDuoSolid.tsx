// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFlagDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.526 3.052a7.03 7.03 0 0 0-5.777-.738l-1.446.448A1.85 1.85 0 0 0 4 4.529v8.927c0 .216.04.471.18.716.145.259.361.437.596.541.409.183.823.121 1.03.08.344-.069.657-.21.983-.328h.002a5.6 5.6 0 0 1 4.562.442 7.6 7.6 0 0 0 6.01.66l1.309-.405A1.89 1.89 0 0 0 20 13.36V4.485c0-.267-.064-.577-.27-.854a1.35 1.35 0 0 0-.723-.492c-.423-.12-.857-.04-1.117.02-.298.07-.591.176-.811.26-.14.053-.278.114-.42.161a5.03 5.03 0 0 1-4.133-.528Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 3v18"
			/>
		</svg>
	)
}

export default IconFlagDuoSolid
