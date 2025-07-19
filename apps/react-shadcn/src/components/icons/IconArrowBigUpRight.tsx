// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigUpRight: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.043 3.92a1 1 0 0 0-.472 1.774q1.136.9 2.226 1.853L4.53 13.814l-.023.023a9 9 0 0 0-.487.51c-.179.2-.316.434-.403.688a2 2 0 0 0 0 1.236c.095.29.254.51.403.686.135.16.309.333.487.512l.023.022 1.98 1.98.022.023c.178.178.352.352.51.487.176.149.398.308.688.402.402.13.834.13 1.236 0 .29-.094.512-.253.686-.402q.266-.234.512-.487l.022-.023 6.268-6.267q.953 1.09 1.853 2.226a1 1 0 0 0 1.773-.473 36.2 36.2 0 0 0 .182-9.354 2.11 2.11 0 0 0-1.864-1.865 36.3 36.3 0 0 0-9.355.183Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowBigUpRight
