// solid/editing
import type { Component, JSX } from "solid-js"

export const IconEyedropperFill: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.306 3.172a4 4 0 0 1 5.657 5.656l-.707.708.117.117a2.834 2.834 0 0 1 0 4.008l-1.275 1.274a1.308 1.308 0 0 1-1.989-.164q-.449-.629-.925-1.235l-5.757 5.757c-.305.305-.572.573-.892.765a3 3 0 0 1-1.401.425c-.372.017-.744-.057-1.166-.142l-.023-.005-1.446.482a8 8 0 0 1-.623.19c-.183.043-.525.109-.89-.022a1.5 1.5 0 0 1-.91-.909c-.13-.365-.063-.707-.02-.89.044-.187.117-.409.19-.624l.48-1.445-.004-.022c-.085-.423-.16-.794-.142-1.167a3 3 0 0 1 .425-1.401c.192-.32.46-.587.765-.892l5.748-5.748a33 33 0 0 0-1.155-.863A1.308 1.308 0 0 1 8.2 5.036l1.274-1.274a2.835 2.835 0 0 1 4.009 0l.117.117zm-3.244 6L7.234 13h5.657l1.004-1.004a33 33 0 0 0-2.833-2.824Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconEyedropperFill
