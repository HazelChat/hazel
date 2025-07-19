// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconLayersTo: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.232 2.337C14.408 1.144 12.938.451 11.379.761L4.137 2.196C2.35 2.551 1.074 4.13 1.062 5.951l-.05 7.5a3.855 3.855 0 0 0 2.72 3.72 3.86 3.86 0 0 1-.684-2.229l.05-7.5c.012-1.822 1.288-3.4 3.074-3.755l7.242-1.435a3.74 3.74 0 0 1 1.818.085Z"
				fill="currentColor"
			/>
			<path
				d="M18.766 5.325c-.825-1.191-2.294-1.882-3.852-1.573L7.672 5.187C5.886 5.542 4.61 7.12 4.598 8.942l-.05 7.5a3.855 3.855 0 0 0 2.734 3.725 3.86 3.86 0 0 1-.686-2.232l.05-7.501c.012-1.822 1.288-3.4 3.074-3.754l7.242-1.436a3.74 3.74 0 0 1 1.803.08Z"
				fill="currentColor"
			/>
			<path
				d="M23 10.55c.016-2.414-2.157-4.278-4.538-3.806L11.22 8.18c-1.786.354-3.062 1.932-3.074 3.754l-.05 7.5c-.015 2.414 2.157 4.278 4.538 3.806l7.242-1.435c1.787-.354 3.062-1.934 3.074-3.755z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconLayersTo
