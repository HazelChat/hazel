// duo-solid/development
import type { Component, JSX } from "solid-js"

export const IconShieldBugDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13.26 1.427a4 4 0 0 0-2.716 0L5.156 3.373A4 4 0 0 0 2.518 6.98l-.128 3.31a12 12 0 0 0 6.048 10.886l1.52.867a4 4 0 0 0 3.887.042l1.488-.806a12 12 0 0 0 6.25-11.472l-.227-2.95a4 4 0 0 0-2.63-3.456z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13.258 9.018q.074-.21.075-.444a1.333 1.333 0 1 0-2.59.444m2.515 0h.857q.317.315.544.713m-1.401-.713h-2.515m0 0h-.858q-.317.315-.544.713m6.66-2.174v.812c0 .636-.45 1.183-1.073 1.308l-.27.054M8 7.557v.812c0 .636.449 1.183 1.072 1.308l.27.054m7.103 5.51v-1.13c0-.636-.45-1.183-1.072-1.307l-.486-.097M7.556 15.24v-1.129c0-.636.448-1.183 1.072-1.307l.485-.097m5.774 0c.145-.385.224-.805.224-1.245 0-.634-.165-1.227-.452-1.731m.228 2.976c-.46 1.224-1.58 2.089-2.887 2.089-1.308 0-2.427-.865-2.887-2.09m0 0a3.5 3.5 0 0 1-.224-1.243c0-.635.165-1.228.452-1.732"
			/>
		</svg>
	)
}

export default IconShieldBugDuoSolid
