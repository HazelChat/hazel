// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPurseBagDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M12 2C9.567 2 7.527 3.785 7.087 6.088c-.366.051-.71.137-1.043.281a4.5 4.5 0 0 0-1.88 1.52c-.3.421-.486.883-.64 1.407-.147.504-.28 1.126-.443 1.885l-.41 1.915c-.276 1.285-.496 2.314-.6 3.15-.106.854-.107 1.618.136 2.343A5 5 0 0 0 4.4 21.302c.659.39 1.406.55 2.263.624C7.503 22 8.554 22 9.87 22h4.262c1.314 0 2.366 0 3.205-.074.858-.075 1.605-.234 2.263-.624a5 5 0 0 0 2.193-2.713c.244-.725.242-1.489.136-2.343-.103-.836-.324-1.865-.6-3.15l-.41-1.915c-.162-.759-.296-1.38-.443-1.885-.153-.524-.34-.986-.64-1.407a4.5 4.5 0 0 0-1.88-1.52 4 4 0 0 0-1.043-.281C16.472 3.785 14.432 2 12 2ZM9.18 6c.423-1.155 1.54-2 2.82-2s2.396.845 2.82 2z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m10 12-1 4m5-4 1 4"
			/>
		</svg>
	)
}

export default IconPurseBagDuoSolid
