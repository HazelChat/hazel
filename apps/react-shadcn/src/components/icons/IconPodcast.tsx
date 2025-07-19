// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPodcast: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 1a10 10 0 0 0-5.556 18.315 1 1 0 0 0 1.112-1.663 8 8 0 1 1 8.888 0 1 1 0 0 0 1.112 1.663A10 10 0 0 0 12 1Z"
				fill="currentColor"
			/>
			<path
				d="M9.897 7.597A4 4 0 0 1 15.2 13.4a1 1 0 0 0 1.6 1.2 6 6 0 1 0-9.6 0 1 1 0 1 0 1.6-1.2 4 4 0 0 1 1.097-5.803Z"
				fill="currentColor"
			/>
			<path d="M12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" fill="currentColor" />
			<path
				d="M12 15a2.442 2.442 0 0 0-2.316 3.214l1.367 4.102a1 1 0 0 0 1.898 0l1.367-4.102A2.44 2.44 0 0 0 12 15Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPodcast
