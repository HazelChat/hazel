// duo-solid/medical
import type { Component, JSX } from "solid-js"

export const IconMedicalThermometerDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.183 3.16a4 4 0 0 1 5.656 5.657l-2.001 2.001-.009.01-.01.009-6.353 6.354c-.52.52-.89.896-1.29 1.185l-.175.119q-.452.29-.955.478l-.34.113c-.403.119-.824.169-1.361.212l-.582.042-1.819.13-2.236 2.238a1.002 1.002 0 0 1-1.415-1.415l2.237-2.237.13-1.819c.053-.733.086-1.259.2-1.74l.054-.204q.151-.516.41-.987L5.505 13c.228-.355.513-.667.891-1.052l.411-.413z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m11.15 13.85 1.188 1.187m1.54-3.916 1.188 1.188M16.5 8.5l1.188 1.188"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m5.5 18.5 2.191-.157m-2.191.158.157-2.192c.064-.88.095-1.321.217-1.733a4 4 0 0 1 .472-1.035c.233-.362.545-.674 1.17-1.299l8.373-8.374M5.5 18.501 3 21"
			/>
		</svg>
	)
}

export default IconMedicalThermometerDuoSolid
