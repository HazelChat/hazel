// duo-solid/automotive
import type { Component, JSX } from "solid-js"

export const IconBusFrontViewBoltDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M10.292 2h3.416c1.054 0 1.903 0 2.592.055.709.056 1.332.175 1.911.46a5 5 0 0 1 1.902 1.642A4 4 0 0 1 23 8v.5a1.5 1.5 0 0 1-1.5 1.5H21v10.5a2.5 2.5 0 0 1-5 0V20H8v.5a2.5 2.5 0 0 1-5 0V10h-.5A1.5 1.5 0 0 1 1 8.5V8a4 4 0 0 1 2.887-3.843 5 5 0 0 1 1.902-1.641C6.368 2.23 6.99 2.11 7.7 2.055 8.39 2 9.238 2 10.292 2Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 8.5 9.846 12h4.308L12 15.5"
			/>
		</svg>
	)
}

export default IconBusFrontViewBoltDuoSolid
