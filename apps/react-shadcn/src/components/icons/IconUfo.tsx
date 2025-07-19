// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconUfo: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 3C9.66 3 7.714 4.502 6.725 6.573c-1.475.345-2.775.842-3.756 1.472C1.908 8.725 1 9.712 1 11c0 .916.468 1.687 1.099 2.284.628.594 1.484 1.083 2.459 1.473C6.512 15.539 9.144 16 12 16s5.488-.461 7.442-1.243c.975-.39 1.83-.88 2.46-1.473C22.531 12.687 23 11.916 23 11c0-1.288-.908-2.275-1.969-2.955-.982-.63-2.28-1.127-3.756-1.473C16.286 4.502 14.341 3 12 3ZM8.372 7.8C9.039 6.072 10.468 5 12 5s2.96 1.072 3.628 2.8c.232.6.356 1.246.37 1.897C14.79 9.89 13.436 10 12 10s-2.79-.11-3.999-.303A5.6 5.6 0 0 1 8.372 7.8Z"
				fill="currentColor"
			/>
			<path d="M4.894 17.447a1 1 0 1 0-1.788-.894l-1 2a1 1 0 1 0 1.788.894z" fill="currentColor" />
			<path d="M20.894 16.553a1 1 0 1 0-1.788.894l1 2a1 1 0 1 0 1.788-.894z" fill="currentColor" />
			<path d="M13 18a1 1 0 1 0-2 0v3a1 1 0 1 0 2 0z" fill="currentColor" />
		</svg>
	)
}

export default IconUfo
