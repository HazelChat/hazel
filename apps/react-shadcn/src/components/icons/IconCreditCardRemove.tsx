// icons/svgs/solid/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCreditCardRemove: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.643 3c1.084 0 1.958 0 2.666.058.729.06 1.369.185 1.961.487a5 5 0 0 1 2.185 2.185c.302.592.428 1.233.487 1.961q.012.15.021.309H1.037l.02-.309c.06-.728.186-1.369.488-1.96A5 5 0 0 1 3.73 3.544c.592-.302 1.233-.428 1.961-.487C6.4 3 7.273 3 8.357 3z"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				d="M23 10H1v3.643c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 2.185 2.185c.592.302 1.233.428 1.961.487C6.4 21 7.273 21 8.357 21h5.407A3 3 0 0 1 16 16h6c.333 0 .654.054.954.155.046-.68.046-1.506.046-2.512zM5.85 12a1 1 0 1 0 0 2h3.3a1 1 0 1 0 0-2z"
				clipRule="evenodd"
				fill="currentColor"
			/>
			<path d="M16 18a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z" fill="currentColor" />
		</svg>
	)
}

export default IconCreditCardRemove
