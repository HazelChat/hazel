// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowLoopDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.925 12.562a1 1 0 0 1 1.055.484l.47.818.238.384q.374.564.847 1.044l.17.166c.4.38.847.714 1.33.991l.819.47.13.09a1 1 0 0 1-.487 1.767c-1.14.163-2.293.202-3.44.117l-.49-.043a1.7 1.7 0 0 1-.977-.44l-.107-.11a1.7 1.7 0 0 1-.414-.83l-.02-.138a16 16 0 0 1 .074-3.93l.034-.154a1 1 0 0 1 .768-.686ZM3.51 5.216a16 16 0 0 1 3.93-.074l.159.024c.312.063.594.21.819.418l.108.108.085.102c.162.21.276.458.327.728l.02.137.043.491c.085 1.147.046 2.3-.117 3.44a1 1 0 0 1-1.857.356l-.467-.812a7 7 0 0 0-.785-1.102l-.305-.33a7 7 0 0 0-1.255-1.007l-.198-.12-.87-.506a1 1 0 0 1 .363-1.853Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6.182 8c-3.164 3.788-3.771 8.553-1.252 11.07 1.832 1.832 4.854 2.01 7.823.752m5.071-3.828c3.16-3.788 3.765-8.549 1.248-11.066-1.832-1.832-4.854-2.01-7.823-.752"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconArrowLoopDuoSolid
