// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconDribbble: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17.108 3.401a15.6 15.6 0 0 1-4.538 4.612 36 36 0 0 0-3.785-5.485A10 10 0 0 1 12 2c1.866 0 3.613.511 5.108 1.401Z"
				fill="currentColor"
			/>
			<path
				d="M18.719 4.593a17.6 17.6 0 0 1-5.214 5.199q.506 1.031.947 2.1a17.5 17.5 0 0 1 4.268-.525c1.119 0 2.213.105 3.275.306a9.97 9.97 0 0 0-3.276-7.08Z"
				fill="currentColor"
			/>
			<path
				d="M21.859 13.685a15.6 15.6 0 0 0-3.14-.318c-1.222 0-2.41.141-3.55.408a36 36 0 0 1 1.675 6.976 10.01 10.01 0 0 0 5.014-7.066Z"
				fill="currentColor"
			/>
			<path
				d="M14.932 21.563a34 34 0 0 0-1.677-7.205 15.55 15.55 0 0 0-7.252 5.645A9.96 9.96 0 0 0 12 22a10 10 0 0 0 2.932-.437Z"
				fill="currentColor"
			/>
			<path
				d="M4.52 18.637a17.55 17.55 0 0 1 8.016-6.146q-.364-.869-.774-1.711a17.4 17.4 0 0 1-7.731 1.796q-1.026-.001-2.02-.116a9.96 9.96 0 0 0 2.509 6.177Z"
				fill="currentColor"
			/>
			<path
				d="M2.118 10.459A10 10 0 0 1 6.9 3.397a34.2 34.2 0 0 1 3.935 5.61 15.4 15.4 0 0 1-6.804 1.569q-.973 0-1.913-.117Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDribbble
