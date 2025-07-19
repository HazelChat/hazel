// solid/development
import type { Component, JSX } from "solid-js"

export const IconCloudExclamation: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.5 3a7.5 7.5 0 0 1 6.627 3.986 44 44 0 0 0 .343.632l.004.007-.003-.004.007.01a.4.4 0 0 0 .067.068l.125.09c.116.082.278.193.506.35A6.5 6.5 0 0 1 16.5 20l-1.5-.001c0-.546-.146-1.058-.401-1.5.255-.44.401-.953.401-1.499v-6a3 3 0 1 0-6 0v6c0 .546.146 1.058.401 1.5A3 3 0 0 0 9 20H6.5A5.5 5.5 0 0 1 3.609 9.82c.475-.294.824-.51 1.068-.664a11 11 0 0 0 .325-.215.3.3 0 0 0 .046-.055l.004-.005.02-.041c.023-.051.055-.124.099-.228.082-.198.193-.473.344-.848A7.5 7.5 0 0 1 12.5 3Z"
				fill="currentColor"
			/>
			<path d="M13 11a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0z" fill="currentColor" />
			<path d="M13 19.999a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z" fill="currentColor" />
		</svg>
	)
}

export default IconCloudExclamation
