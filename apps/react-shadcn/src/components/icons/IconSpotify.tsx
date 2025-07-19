// icons/svgs/solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconSpotify: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12 17.606 22.15 12 22.15 1.85 17.606 1.85 12Zm9.102-3.9c-1.44 0-2.838.18-4.173.52a.9.9 0 0 0 .443 1.744 15 15 0 0 1 3.73-.464c2.203 0 4.294.471 6.18 1.318a.9.9 0 0 0 .737-1.642A16.8 16.8 0 0 0 10.952 8.1Zm0 3c-1.277 0-2.514.172-3.69.495a.9.9 0 1 0 .477 1.736 12 12 0 0 1 3.212-.431c1.757 0 3.424.374 4.928 1.045a.9.9 0 1 0 .734-1.643 13.85 13.85 0 0 0-5.661-1.202Zm0 3c-1.119 0-2.2.169-3.217.483a.9.9 0 1 0 .53 1.72 9.1 9.1 0 0 1 2.686-.403c1.331 0 2.592.285 3.73.796a.9.9 0 0 0 .738-1.641 10.9 10.9 0 0 0-4.468-.955Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSpotify
