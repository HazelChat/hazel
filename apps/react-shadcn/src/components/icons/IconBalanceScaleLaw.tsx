// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconBalanceScaleLaw: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13 2a1 1 0 1 0-2 0v.803c-.94.1-1.87.339-2.756.719L6.66 4.2a3.8 3.8 0 0 1-1.528.309 1 1 0 0 0-.202-.007 3.8 3.8 0 0 1-1.484-.396 1 1 0 0 0-.895 1.788q.475.237.977.383l-2.326 4.942a4.195 4.195 0 1 0 7.593 0L6.506 6.35q.48-.114.943-.312l1.583-.678A7.5 7.5 0 0 1 11 4.817V20H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3V4.817c.671.09 1.333.271 1.968.543l1.582.678q.463.198.944.312l-2.29 4.869a4.195 4.195 0 1 0 7.593 0L20.47 6.277a6 6 0 0 0 .976-.383 1 1 0 1 0-.895-1.788 3.8 3.8 0 0 1-1.483.396 1 1 0 0 0-.203.007 3.8 3.8 0 0 1-1.528-.309l-1.583-.678A9.5 9.5 0 0 0 13 2.803zM3.046 12 5 7.849 6.953 12zm14 0L19 7.849 20.953 12z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBalanceScaleLaw
