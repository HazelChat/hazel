// contrast/money-&-payments
import type { Component, JSX } from "solid-js"

export const IconMoneyDollarBag1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.192 21.765c2.53.313 5.088.313 7.617 0 7.813-.969 5.263-12.746-.922-14.777a5.9 5.9 0 0 0-1.85-.298h-2.073q-.483 0-.945.076C3.194 7.876.008 20.75 8.192 21.765Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 10.303v.83m0 0h-.767c-.848 0-1.536.742-1.536 1.658s.688 1.658 1.536 1.658h1.535c.848 0 1.536.742 1.536 1.658s-.688 1.659-1.536 1.659H12m0-6.634h.816c.528 0 .994.288 1.27.726M12 17.765v.83m0-.83h-.816c-.527 0-.993-.287-1.27-.725m4.973-10.052a5.9 5.9 0 0 0-1.85-.298h-2.073q-.483 0-.945.076m4.868.222c6.185 2.031 8.735 13.808.922 14.777-2.53.313-5.088.313-7.617 0C.008 20.75 3.194 7.875 10.019 6.766m4.868.222 1.777-4.444-.65-.26a3.98 3.98 0 0 0-3.68.384 3.97 3.97 0 0 1-2.984.59l-.977-.195 1.646 3.703"
			/>
		</svg>
	)
}

export default IconMoneyDollarBag1
