// solid/automotive
import type { Component, JSX } from "solid-js"

export const IconBusFrontViewBolt: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13.708 2h-3.416C9.238 2 8.389 2 7.7 2.055c-.709.056-1.332.175-1.911.46a5 5 0 0 0-1.902 1.642A4 4 0 0 0 1 8v.5A1.5 1.5 0 0 0 2.5 10H3v10.5a2.5 2.5 0 0 0 5 0V20h8v.5a2.5 2.5 0 0 0 5 0V10h.5A1.5 1.5 0 0 0 23 8.5V8a4 4 0 0 0-2.887-3.843 5 5 0 0 0-1.902-1.641c-.579-.286-1.202-.405-1.911-.461C15.61 2 14.762 2 13.708 2Zm-.856 7.024a1 1 0 0 0-1.704-1.048l-2.153 3.5A1 1 0 0 0 9.846 13h2.518l-1.216 1.976a1 1 0 0 0 1.704 1.048l2.153-3.5A1 1 0 0 0 14.154 11h-2.518z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBusFrontViewBolt
