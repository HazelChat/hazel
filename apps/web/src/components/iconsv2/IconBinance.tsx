// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconBinance: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.326 2.606a3.29 3.29 0 0 0-4.653 0L6.14 6.139a1 1 0 0 0 1.415 1.415l3.533-3.534a1.29 1.29 0 0 1 1.825 0l3.534 3.534a1 1 0 0 0 1.414-1.415z"
				fill="currentColor"
			/>
			<path
				d="M13.516 8.668a2.145 2.145 0 0 0-3.034 0l-1.815 1.815a2.145 2.145 0 0 0 0 3.034l1.815 1.815a2.145 2.145 0 0 0 3.034 0l1.814-1.815a2.145 2.145 0 0 0 0-3.034z"
				fill="currentColor"
			/>
			<path
				d="M4.118 10.99a1 1 0 0 0-1.414-1.415l-.341.341a2.947 2.947 0 0 0 0 4.168l.341.34a1 1 0 0 0 1.414-1.414l-.34-.34a.947.947 0 0 1-.001-1.34z"
				fill="currentColor"
			/>
			<path
				d="M21.296 9.575a1 1 0 1 0-1.415 1.414l.341.341c.37.37.37.97 0 1.34l-.34.34a1 1 0 0 0 1.413 1.415l.342-.341a2.947 2.947 0 0 0 0-4.168z"
				fill="currentColor"
			/>
			<path
				d="M7.554 16.446a1 1 0 1 0-1.415 1.414l3.534 3.534a3.29 3.29 0 0 0 4.653 0l3.534-3.534a1 1 0 0 0-1.414-1.414l-3.534 3.534a1.29 1.29 0 0 1-1.825 0z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBinance
