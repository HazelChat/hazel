// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowTurnRightUp: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 21a1 1 0 1 1 0-2h3c1.417 0 2.419 0 3.203-.065.772-.063 1.243-.182 1.613-.371a4 4 0 0 0 1.748-1.748c.189-.37.308-.841.371-1.613C14 14.419 14 13.417 14 12V9.373q-1.003.044-2 .175c-.443.058-.889.134-1.83.296a1 1 0 0 1-.974-1.58 26.2 26.2 0 0 1 4.684-4.87 1.79 1.79 0 0 1 2.24 0 26.2 26.2 0 0 1 4.684 4.87 1 1 0 0 1-.973 1.58A49 49 0 0 0 18 9.548a23 23 0 0 0-2-.175v2.67c0 1.364 0 2.448-.071 3.322-.074.896-.227 1.66-.583 2.359a6 6 0 0 1-2.622 2.622c-.7.356-1.463.51-2.359.583C9.491 21 8.407 21 7.044 21z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowTurnRightUp
