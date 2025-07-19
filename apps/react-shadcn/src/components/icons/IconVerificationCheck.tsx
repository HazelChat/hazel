// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconVerificationCheck: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.522 3.587C9.32 2.491 10.557 1.75 12 1.75c1.44 0 2.685.74 3.486 1.837 1.34-.21 2.746.145 3.764 1.163s1.373 2.425 1.163 3.767c1.094.802 1.837 2.039 1.837 3.483s-.743 2.68-1.837 3.483c.21 1.342-.145 2.748-1.163 3.767-1.021 1.02-2.427 1.365-3.762 1.16-.801 1.1-2.046 1.84-3.488 1.84-1.446 0-2.683-.744-3.485-1.84-1.337.206-2.743-.139-3.765-1.16-1.02-1.021-1.366-2.429-1.154-3.767-1.094-.8-1.846-2.036-1.846-3.483s.752-2.682 1.846-3.483c-.212-1.338.133-2.746 1.154-3.767s2.426-1.373 3.772-1.163Zm7.042 7.094a1 1 0 1 0-1.128-1.652l-.087.06a13.8 13.8 0 0 0-3.517 3.468l-1.125-1.124a1 1 0 0 0-1.414 1.415l2.007 2.004a1 1 0 0 0 1.575-.21 11.84 11.84 0 0 1 3.602-3.902z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconVerificationCheck
