// icons/svgs/stroke/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconFile02PdfFormatStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 19v-5h1.5a2.5 2.5 0 0 1 0 5zm0 0v2m14-3v-4h4m-4 4v3m0-3h4M11 2h1a8 8 0 0 1 8 8h-.17A3 3 0 0 0 17 8h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3Zm0 0H8a4 4 0 0 0-4 4v4m6 4v7h.5a3.5 3.5 0 1 0 0-7z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFile02PdfFormatStroke
