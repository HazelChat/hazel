// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListMusicNoteDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4 12h6m-6 6h6M4 6h16"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M19 13.024c0-.763-.38-1.468-1-1.889v6.366a2.5 2.5 0 1 1-2-2.45v-4.23a1.82 1.82 0 0 1 2.634-1.627A4.28 4.28 0 0 1 21 13.024c0 .65-.134 1.295-.4 1.887a1 1 0 0 1-1.824-.822c.146-.325.224-.688.224-1.065Z"
			/>
		</svg>
	)
}

export default IconListMusicNoteDuoSolid
