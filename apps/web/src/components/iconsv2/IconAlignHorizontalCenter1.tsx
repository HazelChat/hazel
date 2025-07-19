// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignHorizontalCenter1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M14.12 11.703c.925-1.017 2-1.925 3.196-2.703a30.6 30.6 0 0 0 0 6 16.4 16.4 0 0 1-3.197-2.703A.44.44 0 0 1 14 12c0-.105.04-.21.12-.297Z"
				/>
				<path
					fill="currentColor"
					d="M9.88 12.297c-.925 1.017-2 1.925-3.196 2.703a30.6 30.6 0 0 0 0-6 16.4 16.4 0 0 1 3.197 2.703A.44.44 0 0 1 10 12a.44.44 0 0 1-.12.297Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17.168 12H21m-3.832 0q0-1.502.148-3a16.4 16.4 0 0 0-3.197 2.703A.44.44 0 0 0 14 12c0 .105.04.21.12.297.925 1.017 2 1.925 3.196 2.703a31 31 0 0 1-.148-3ZM6.832 12H3m3.832 0q0 1.502-.148 3a16.4 16.4 0 0 0 3.197-2.703A.44.44 0 0 0 10 12a.44.44 0 0 0-.12-.297c-.925-1.017-2-1.925-3.196-2.703q.147 1.498.148 3ZM12 5v14"
			/>
		</svg>
	)
}

export default IconAlignHorizontalCenter1
