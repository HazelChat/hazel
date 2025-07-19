// icons/svgs/solid/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconPhoneCancel: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.746 13.223c.432-.321.895-.674 1.3-1.05A6.43 6.43 0 0 0 9.905 5.86c-.197-.77-.505-1.65-1.052-2.378-.574-.76-1.411-1.344-2.576-1.45-.44-.039-1.025-.056-1.541.028-1.895.31-2.885 2.151-2.694 3.766.336 2.85 1.19 5.43 2.504 7.656a16.8 16.8 0 0 0 5.641 5.772c2.299 1.427 4.992 2.351 7.983 2.704 1.616.19 3.456-.8 3.765-2.694a6 6 0 0 0 .018-1.645c-.147-1.235-.832-2.082-1.661-2.64-.797-.535-1.747-.823-2.544-1.006a6.43 6.43 0 0 0-5.763 1.511c-.53.483-1.024 1.067-1.463 1.595a14.7 14.7 0 0 1-3.776-3.856Z"
				fill="currentColor"
			/>
			<path
				d="M15.207 3.793a1 1 0 1 0-1.414 1.414L15.586 7l-1.793 1.793a1 1 0 1 0 1.414 1.414L17 8.414l1.793 1.793a1 1 0 0 0 1.414-1.414L18.414 7l1.793-1.793a1 1 0 0 0-1.414-1.414L17 5.586z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPhoneCancel
