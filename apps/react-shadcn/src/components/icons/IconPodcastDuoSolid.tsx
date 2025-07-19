// icons/svgs/duo-solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPodcastDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M6.043 2.968a10 10 0 1 1 11.513 16.347 1 1 0 0 1-1.112-1.663 8 8 0 1 0-8.888 0 1 1 0 0 1-1.112 1.663 10 10 0 0 1-.401-16.347ZM12 7a4 4 0 0 0-3.2 6.4 1 1 0 0 1-1.6 1.2 6 6 0 1 1 9.6 0 1 1 0 0 1-1.6-1.2A4 4 0 0 0 12 7Z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path fill="currentColor" d="M12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
			<path
				fill="currentColor"
				d="M12 15a2.442 2.442 0 0 0-2.316 3.214l1.367 4.102a1 1 0 0 0 1.898 0l1.367-4.102A2.442 2.442 0 0 0 12 15Z"
			/>
		</svg>
	)
}

export default IconPodcastDuoSolid
