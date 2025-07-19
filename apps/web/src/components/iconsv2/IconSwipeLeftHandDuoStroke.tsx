// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconSwipeLeftHandDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16.325 2c-.79.37-1.527.84-2.193 1.396a.32.32 0 0 0-.107.18l-.001.004m1.51 2.341a10 10 0 0 1-1.48-2.136.32.32 0 0 1-.03-.205m0 0L14 3.577m.024.003c2.94.45 5.599 1.752 7.716 3.647"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m8.763 20.205-5.788-5.207a.79.79 0 0 1 .004-1.18 3.16 3.16 0 0 1 3.884-.243l1.767 1.21-2.588-9.66A2 2 0 1 1 9.905 4.09l1.553 5.796 4.852-.47c3.558-.345 4.734 3.472 4.452 6.37-.496 5.103-8.24 7.801-12 4.419Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconSwipeLeftHandDuoStroke
