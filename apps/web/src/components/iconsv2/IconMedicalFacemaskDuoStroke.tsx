// duo-stroke/medical
import type { Component, JSX } from "solid-js"

export const IconMedicalFacemaskDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 7.999h.493c.471 0 .707 0 .902.04a2 2 0 0 1 1.566 1.564c.039.196.039.431.039.902 0 .424 0 .636-.026.832a3 3 0 0 1-1.134 1.975c-.157.122-.34.228-.706.442l-1.15.671m0 0c.016-.224.016-.5.016-.914V8.313c0-.759 0-1.138-.113-1.46a2 2 0 0 0-.797-1.014c-.286-.186-.655-.276-1.392-.455-1.906-.463-2.86-.695-3.822-.809a16 16 0 0 0-3.752 0c-.963.114-1.916.346-3.822.809-.737.18-1.106.269-1.392.455a2 2 0 0 0-.797 1.014c-.096.274-.11.59-.113 1.146m15.983 6.426a3 3 0 0 1-.04.313 3 3 0 0 1-.845 1.56c-.211.206-.473.377-.996.719-1.666 1.087-2.5 1.63-3.362 1.945a8 8 0 0 1-5.48 0c-.863-.315-1.696-.858-3.362-1.945-.523-.342-.785-.513-.996-.72a3 3 0 0 1-.844-1.559 3 3 0 0 1-.041-.313m0 0C4 14.201 4 13.925 4 13.511V7.999m.017 6.426-1.151-.671c-.366-.214-.55-.32-.706-.442a3 3 0 0 1-1.134-1.974C1 11.14 1 10.929 1 10.506c0-.472 0-.707.04-.903a2 2 0 0 1 1.565-1.565c.195-.04.43-.04.902-.04H4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 9.999h8m-6.667 4h5.334"
				fill="none"
			/>
		</svg>
	)
}

export default IconMedicalFacemaskDuoStroke
