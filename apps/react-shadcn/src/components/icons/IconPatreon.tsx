// icons/svgs/solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconPatreon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.892 2.205c3.016-1.423 7.103-1.559 10.22-.55 2.63.85 5.015 3.255 5.019 6.352.005 3.443-2.27 6.034-5.487 6.83-1.636.405-2.638.735-3.44 1.81-.345.462-.65 1.119-1.02 1.942-.239.533-.503 1.123-.803 1.664-.746 1.35-1.913 2.773-4.048 2.747-1.399-.018-2.47-.67-3.245-1.61-.748-.91-1.226-2.096-1.541-3.279-.631-2.37-.692-5.064-.675-6.506.04-3.596 1.143-7.57 5.02-9.4Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPatreon
