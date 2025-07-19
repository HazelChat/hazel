// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPlayCircle: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Zm1.322 7.81c-.593-.381-1.052-.677-1.426-.871-.374-.195-.7-.31-1.02-.287a1.75 1.75 0 0 0-1.277.697c-.192.257-.272.593-.31 1.013-.039.42-.039.966-.039 1.67v.236c0 .704 0 1.25.038 1.67.039.42.119.756.311 1.013.304.407.77.66 1.276.697.32.023.647-.092 1.021-.287s.833-.49 1.425-.87l.185-.12c.513-.329.913-.586 1.206-.814.295-.23.51-.453.626-.726a1.75 1.75 0 0 0 0-1.362c-.115-.273-.331-.496-.626-.726-.293-.228-.693-.485-1.206-.815z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPlayCircle
