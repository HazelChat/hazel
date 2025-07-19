// icons/svgs/solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconPatreonOldLogo: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.474 2c-.21 0-.415 0-.59.012-.19.013-.415.043-.65.14a2 2 0 0 0-1.082 1.083c-.097.234-.127.46-.14.65C4 4.059 4 4.263 4 4.473v15.054c0 .21 0 .414.012.588.013.19.043.416.14.65a2 2 0 0 0 1.083 1.083c.234.097.46.127.65.14.174.012.378.012.588.012h.053c.21 0 .415 0 .59-.012a2 2 0 0 0 .65-.14 2 2 0 0 0 1.082-1.083 2 2 0 0 0 .14-.65C9 19.941 9 19.737 9 19.527V4.473c0-.21 0-.415-.012-.59a2 2 0 0 0-.14-.65 2 2 0 0 0-1.083-1.082 2 2 0 0 0-.65-.14C6.941 2 6.737 2 6.527 2z"
				fill="currentColor"
			/>
			<path d="M16.15 2a6.15 6.15 0 1 0 0 12.3 6.15 6.15 0 0 0 0-12.3Z" fill="currentColor" />
		</svg>
	)
}

export default IconPatreonOldLogo
