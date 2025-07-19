// icons/svgs/duo-stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconTelegramDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m5.022 10.792 13.89-5.396c.772-.3 1.159-.45 1.443-.378a.9.9 0 0 1 .573.448c.133.254.065.653-.072 1.45l-1.558 9.082c-.237 1.38-.356 2.071-.73 2.456a1.82 1.82 0 0 1-1.253.546c-.545.014-1.154-.36-2.373-1.107l-2.586-1.587c-.776-.476-1.165-.714-1.332-1.035a1.27 1.27 0 0 1-.105-.91c.091-.348.416-.664 1.066-1.295l4.366-4.24-7.354 4.285c-.59.344-.884.515-1.201.609-.281.083-.575.12-.868.111-.332-.01-.662-.102-1.323-.286l-.445-.123c-1.231-.342-1.847-.513-2.03-.803a.85.85 0 0 1-.043-.827c.151-.307.746-.538 1.935-1Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m5.605 13.546-.445-.124c-1.231-.342-1.847-.513-2.03-.803a.85.85 0 0 1-.043-.827c.151-.307.746-.538 1.935-1m9.92 7.1c1.219.748 1.828 1.122 2.373 1.108a1.8 1.8 0 0 0 1.254-.546c.373-.385.492-1.075.729-2.456"
				fill="none"
			/>
		</svg>
	)
}

export default IconTelegramDuoStroke
