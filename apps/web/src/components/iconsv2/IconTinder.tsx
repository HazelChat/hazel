// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconTinder: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13.11 1.058c-.888-.296-1.502.477-1.502 1.103q0 .078.012.153c.216 1.394.163 2.757-.294 3.874-.363.888-1 1.67-2.08 2.217a5 5 0 0 1-.143-.511 8 8 0 0 1-.173-1.157c-.038-.932-1.063-1.327-1.742-.903a8.717 8.717 0 0 0 4.903 16.158c5.371-.012 9.08-4.252 9.08-9.026 0-6.08-4.27-10.064-7.938-11.857q-.06-.03-.123-.05ZM6.935 6.873l.001.017z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconTinder
