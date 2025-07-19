// icons/svgs/contrast/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconArchiveBolt1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 8a1 1 0 0 0-.897-.995L4 7a1 1 0 0 1-.634-.227l-.073-.066A1 1 0 0 1 3 6V5l.005-.099a1 1 0 0 1 .222-.535l.066-.073a1 1 0 0 1 .608-.288L4 4h16a1 1 0 0 1 .634.227l.073.066A1 1 0 0 1 21 5v1a1 1 0 0 1-1 1 1 1 0 0 0-1 1v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4 8h16M4 8v9a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8M4 8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m12 11-2.251 3.002a.5.5 0 0 0 .482.793l3.538-.59a.5.5 0 0 1 .482.793L12 18"
			/>
		</svg>
	)
}

export default IconArchiveBolt1
