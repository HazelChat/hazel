// solid/ar-&-vr
import type { Component, JSX } from "solid-js"

export const Icon3dSphere: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.91 10.882a10.16 10.16 0 0 1 7.94-8.803C8.678 4.882 8 8.316 8 12q0 .356.008.71c-2.307-.348-4.384-.986-6.097-1.829Zm-.003 2.199a10.16 10.16 0 0 0 7.943 8.841c-.875-2.093-1.475-4.537-1.722-7.175-2.28-.307-4.39-.88-6.221-1.666Zm8.25 1.865c.3 2.755 1.01 5.225 1.994 7.203 5.172-.075 9.408-4.02 9.942-9.068C19.26 14.298 15.76 15.003 12 15.003q-.933 0-1.842-.057Zm11.932-4.064c-.551-5.03-4.779-8.955-9.938-9.03C10.827 4.512 10 8.064 10 12q0 .47.015.931.975.07 1.985.071c3.907 0 7.435-.815 10.09-2.12Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default Icon3dSphere
