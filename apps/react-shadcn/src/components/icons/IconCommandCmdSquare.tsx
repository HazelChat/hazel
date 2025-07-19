// icons/svgs/solid/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconCommandCmdSquare: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8 8.667a.667.667 0 0 1 1.333 0v.666h-.666A.667.667 0 0 1 8 8.667Z"
				fill="currentColor"
			/>
			<path d="M11.333 12.667v-1.334h1.334v1.334z" fill="currentColor" />
			<path d="M15.333 9.333h-.666v-.666a.667.667 0 1 1 .666.666Z" fill="currentColor" />
			<path d="M14.667 15.333v-.666h.666a.667.667 0 1 1-.666.666Z" fill="currentColor" />
			<path d="M8.667 14.667h.666v.666a.667.667 0 1 1-.666-.666Z" fill="currentColor" />
			<path
				fillRule="evenodd"
				d="M10.956 2h2.088c1.363 0 2.447 0 3.321.071.896.074 1.66.227 2.359.583a6 6 0 0 1 2.622 2.622c.356.7.51 1.463.583 2.359.071.874.071 1.958.071 3.321v2.088c0 1.363 0 2.447-.071 3.321-.074.896-.227 1.66-.583 2.359a6 6 0 0 1-2.622 2.622c-.7.356-1.463.51-2.359.583-.874.071-1.958.071-3.321.071h-2.088c-1.363 0-2.447 0-3.321-.071-.896-.074-1.66-.227-2.359-.583a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.359C2 15.491 2 14.407 2 13.044v-2.088c0-1.363 0-2.447.071-3.321.074-.896.227-1.66.583-2.359a6 6 0 0 1 2.622-2.622c.7-.356 1.463-.51 2.359-.583C8.509 2 9.593 2 10.956 2Zm.377 6.667v.666h1.334v-.666a2.667 2.667 0 1 1 2.666 2.666h-.666v1.334h.666a2.667 2.667 0 1 1-2.666 2.666v-.666h-1.334v.666a2.667 2.667 0 1 1-2.666-2.666h.666v-1.334h-.666a2.667 2.667 0 1 1 2.666-2.666Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCommandCmdSquare
