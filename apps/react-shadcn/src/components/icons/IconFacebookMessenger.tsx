// icons/svgs/solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconFacebookMessenger: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M12 2C6.415 2 2 6.127 2 11.73c0 2.864 1.16 5.37 3.071 7.122l.046 1.48a1.72 1.72 0 0 0 2.413 1.522l1.697-.748a11 11 0 0 0 2.773.356c5.585 0 10-4.127 10-9.73S17.585 2 12 2Zm4.83 8.558a1 1 0 1 0-1.66-1.116l-1.691 2.516-1.872-1.784a1.5 1.5 0 0 0-2.256.214l-2.165 3.03a1 1 0 1 0 1.628 1.163l1.83-2.562 1.884 1.796a1.5 1.5 0 0 0 2.28-.25z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconFacebookMessenger
