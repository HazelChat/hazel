// solid/general
import type { Component, JSX } from "solid-js"

export const IconDangerSkull: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M4 10a8 8 0 0 1 16 0v4.419c0 1.374-.88 2.595-2.184 3.03A1.19 1.19 0 0 0 17 18.58v.094A3.325 3.325 0 0 1 13.675 22h-3.35A3.325 3.325 0 0 1 7 18.675v-.094c0-.514-.329-.97-.816-1.132A3.19 3.19 0 0 1 4 14.419zm5.3-1a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm5.4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDangerSkull
