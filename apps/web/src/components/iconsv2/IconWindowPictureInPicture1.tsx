// contrast/devices
import type { Component, JSX } from "solid-js"

export const IconWindowPictureInPicture1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M19.362 4.327C18.72 4 17.88 4 16.2 4H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C3 6.28 3 7.12 3 8.8v6.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C5.28 20 6.12 20 7.8 20h1.462a4.8 4.8 0 0 1-.232-1.17C9 18.454 9 18.027 9 17.669v-2.34c0-.357 0-.784.03-1.16a4.5 4.5 0 0 1 .46-1.713 4.5 4.5 0 0 1 1.967-1.967 4.5 4.5 0 0 1 1.713-.46c.376-.03.803-.03 1.16-.03h4.34c.357 0 .783 0 1.16.03.312.026.722.08 1.17.232V8.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M21.966 15.402v-.036c0-.39 0-.74-.024-1.03a2.5 2.5 0 0 0-.248-.97 2.5 2.5 0 0 0-1.093-1.091 2.5 2.5 0 0 0-.968-.25q-.515-.032-1.03-.023H14.33c-.39 0-.74 0-1.03.024a2.5 2.5 0 0 0-.97.249 2.5 2.5 0 0 0-1.091 1.092 2.5 2.5 0 0 0-.25.968c-.023.292-.023.642-.023 1.03v2.273c0 .39 0 .74.024 1.03.025.313.083.644.249.97a2.5 2.5 0 0 0 1.092 1.092c.325.165.656.223.968.248.292.024.642.024 1.03.024h4.273c.39 0 .74 0 1.03-.024.313-.025.644-.083.969-.248a2.5 2.5 0 0 0 1.092-1.093 2.5 2.5 0 0 0 .25-.968c.023-.292.023-.642.023-1.03V15.4z"
				clip-rule="evenodd"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 9.216V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2.22"
			/>
		</svg>
	)
}

export default IconWindowPictureInPicture1
