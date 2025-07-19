// icons/svgs/contrast/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconCodepen1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m20.635 7.613-7-4.55a3 3 0 0 0-3.27 0l-7 4.55A3 3 0 0 0 2 10.128v3.744a3 3 0 0 0 1.365 2.515l7 4.55a3 3 0 0 0 3.27 0l7-4.55A3 3 0 0 0 22 13.872v-3.744a3 3 0 0 0-1.365-2.515Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 21.422v-6.584m0-12.26v6.584m9.659 6.1L13.72 9.703a3 3 0 0 0-3.44 0l-7.94 5.558m19.318 0c.22-.422.341-.897.341-1.389v-3.744c0-.491-.12-.967-.341-1.39m0 6.523c-.235.45-.585.84-1.024 1.126l-7 4.55a3 3 0 0 1-3.27 0l-7-4.55a3 3 0 0 1-1.024-1.126M21.66 8.74l-7.939 5.557a3 3 0 0 1-3.44 0L2.34 8.739m19.318 0a3 3 0 0 0-1.024-1.126l-7-4.55a3 3 0 0 0-3.27 0l-7 4.55c-.44.285-.789.676-1.024 1.126m0 0c-.22.422-.341.898-.341 1.39v3.743c0 .492.12.967.341 1.39"
			/>
		</svg>
	)
}

export default IconCodepen1
