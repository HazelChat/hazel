// solid/security
import type { Component, JSX } from "solid-js"

export const IconEye02Off: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22.707 2.707a1 1 0 0 0-1.414-1.414l-5.365 5.365C14.782 6.244 13.474 6 12 6 8.572 6 6.07 7.318 4.427 8.976 2.826 10.593 2 12.583 2 14a1 1 0 1 0 2 0c0-.77.524-2.28 1.848-3.617C7.131 9.088 9.128 8 12 8c.852 0 1.625.096 2.323.263l-1.775 1.774a4 4 0 0 0-4.511 4.511l-6.744 6.745a1 1 0 1 0 1.414 1.414z"
				fill="currentColor"
			/>
			<path
				d="M20.163 9.63a1 1 0 1 0-1.544 1.27C19.611 12.106 20 13.338 20 14a1 1 0 1 0 2 0c0-1.242-.634-2.909-1.837-4.37Z"
				fill="currentColor"
			/>
			<path
				d="M15.874 15a1 1 0 0 0-1.676-.956l-2.154 2.154A1 1 0 0 0 13 17.874 4 4 0 0 0 15.874 15Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconEye02Off
