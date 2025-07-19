// solid/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphChartPyramid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.194 4.335a2.478 2.478 0 0 0-4.39 0L7.68 8.262A.5.5 0 0 0 8.12 9h7.762a.5.5 0 0 0 .44-.738zm3.75 6.927a.5.5 0 0 0-.44-.262H6.495a.5.5 0 0 0-.44.262l-1.623 3a.5.5 0 0 0 .44.738H19.13a.5.5 0 0 0 .44-.738zM2.32 18.159l.486-.897a.5.5 0 0 1 .44-.262h17.508a.5.5 0 0 1 .44.262l.486.897c.895 1.653-.197 3.849-2.195 3.849H4.515c-1.998 0-3.09-2.196-2.195-3.85Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconGraphChartPyramid
