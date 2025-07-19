// solid/food
import type { Component, JSX } from "solid-js"

export const IconEggBroken: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.467 2.986C9.464 2.12 10.66 1.5 12 1.5s2.537.619 3.533 1.486c.997.869 1.86 2.04 2.565 3.301 1.4 2.505 2.291 5.575 2.291 7.824a8.389 8.389 0 1 1-16.778 0c0-2.25.892-5.32 2.292-7.824l.112-.198q.602.253 1.152.595A8.6 8.6 0 0 1 9.34 8.605l-1.428 1.977c-.24.332-.281.801-.04 1.186.787 1.253 1.885 2.321 3.465 2.855a1 1 0 1 0 .64-1.895c-.845-.285-1.51-.806-2.056-1.512l1.425-1.973c.257-.354.292-.856.021-1.256a10.46 10.46 0 0 0-4.224-3.585 10.3 10.3 0 0 1 1.324-1.416Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconEggBroken
