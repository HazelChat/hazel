// duo-solid/weather
import type { Component, JSX } from "solid-js"

export const IconLeafDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18.346 2.244a1 1 0 0 1 1.62.496l.142.546c1.41 5.63 1.146 10.725-1.3 13.926-2.545 3.33-7.085 4.2-13.21 2.148l-.597-.209a1 1 0 0 1-.613-.633c-1.283-3.975-1.343-6.889-.437-9.047.921-2.193 2.743-3.38 4.677-4.113 1.892-.718 4.096-1.067 5.845-1.45.904-.2 1.698-.406 2.359-.67.662-.266 1.123-.562 1.416-.897z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M4 20.5c0-3.685 2.266-6.439 4.355-8.202a20 20 0 0 1 2.898-2.018c.44-.252.892-.469 1.345-.695v-.001a.999.999 0 1 1 .802 1.831l.001.001h0c-.034.015-.49.22-1.154.6a18 18 0 0 0-2.602 1.811C7.735 15.44 6 17.685 6 20.5a1 1 0 0 1-2 0Z"
			/>
		</svg>
	)
}

export default IconLeafDuoSolid
