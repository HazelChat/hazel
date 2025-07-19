// icons/svgs/duo-solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserSettingsDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 19a5 5 0 0 1 5-5h4.409c-.149.35-.233.736-.237 1.14l-.005.444-.31.317a3 3 0 0 0 0 4.198l.31.317.005.444c.004.404.088.79.237 1.14H6a3 3 0 0 1-3-3Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm6.7 11.286a1 1 0 0 0-1.4 0l-.891.873-1.248.013a1 1 0 0 0-.99.99l-.012 1.247-.873.891a1 1 0 0 0 0 1.4l.873.891.013 1.248a1 1 0 0 0 .99.99l1.247.012.891.873a1 1 0 0 0 1.4 0l.891-.873 1.248-.013a1 1 0 0 0 .99-.99l.012-1.247.873-.891a1 1 0 0 0 0-1.4l-.873-.891-.013-1.248a1 1 0 0 0-.99-.99l-1.247-.012zm-1.179 2.583.479-.47.479.47a1 1 0 0 0 .69.285l.67.007.007.67a1 1 0 0 0 .285.69l.47.479-.47.479a1 1 0 0 0-.285.69l-.007.67-.67.007a1 1 0 0 0-.69.285l-.479.47-.479-.47a1 1 0 0 0-.69-.285l-.67-.007-.007-.67a1 1 0 0 0-.285-.69l-.47-.479.47-.479a1 1 0 0 0 .285-.69l.007-.67.67-.007a1 1 0 0 0 .69-.285ZM18 17a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconUserSettingsDuoSolid
