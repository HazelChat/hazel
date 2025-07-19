// icons/svgs/stroke/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconCameraScanStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.515 8c.45 0 .676 0 .864.036a2 2 0 0 1 1.585 1.585c.036.188.036.413.036.864V12.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C15.48 16 14.92 16 13.8 16h-3.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C7 14.48 7 13.92 7 12.8v-2.315c0-.45 0-.676.036-.864a2 2 0 0 1 1.585-1.585C8.81 8 9.034 8 9.485 8c.1 0 .148 0 .196-.005a1 1 0 0 0 .541-.224c.037-.03.072-.065.142-.135l.167-.167c.173-.173.26-.26.36-.322a1 1 0 0 1 .29-.12C11.296 7 11.418 7 11.663 7h.674c.245 0 .367 0 .482.028a1 1 0 0 1 .29.12c.1.061.187.148.36.32l.167.168c.07.07.105.105.142.135a1 1 0 0 0 .541.224c.047.005.097.005.196.005Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 7.8v-.3c.001-1.483.02-2.26.327-2.862a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3H8M3 16.2v.3c.001 1.483.02 2.26.327 2.862a3 3 0 0 0 1.311 1.311C5.28 21 6.12 21 7.8 21H8m13-4.8v.3c-.001 1.483-.02 2.26-.327 2.862a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H16m5-13.2v-.3c-.001-1.483-.02-2.26-.327-2.862a3 3 0 0 0-1.311-1.311C18.72 3 17.88 3 16.2 3H16"
				fill="none"
			/>
		</svg>
	)
}

export default IconCameraScanStroke
