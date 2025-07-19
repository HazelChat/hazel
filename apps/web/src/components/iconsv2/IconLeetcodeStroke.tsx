// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconLeetcodeStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m6.897 8.904-.037.038c-1.308 1.345-1.961 2.017-2.319 2.738a5.24 5.24 0 0 0 0 4.64c.358.72 1.011 1.393 2.319 2.738s1.961 2.018 2.663 2.385a4.85 4.85 0 0 0 4.51 0c.701-.367 1.355-1.04 2.662-2.385l.002-.001.379-.39M6.896 8.904c1.284-1.32 1.932-1.983 2.627-2.347a4.85 4.85 0 0 1 4.51 0c.701.367 1.355 1.04 2.662 2.385l.38.391M6.898 8.904 13.609 2m-2.942 12.222h10"
				fill="none"
			/>
		</svg>
	)
}

export default IconLeetcodeStroke
