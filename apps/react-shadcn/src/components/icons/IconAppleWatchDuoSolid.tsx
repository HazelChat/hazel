// icons/svgs/duo-solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconAppleWatchDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M10.815 1h-.126c-.52-.001-1.04-.003-1.501.186a2.5 2.5 0 0 0-1.022.773c-.308.393-.448.894-.588 1.394l-.034.122-.506 1.789A1 1 0 0 0 8.5 6.402a3 3 0 0 1 .352-.174c.225-.093.52-.158 1.027-.192C10.396 6 11.056 6 12 6s1.605 0 2.12.036c.508.034.803.099 1.028.192q.183.076.352.174a1 1 0 0 0 1.462-1.138l-.506-1.79-.034-.121c-.14-.5-.28-1.001-.588-1.394a2.5 2.5 0 0 0-1.021-.773C14.35.997 13.83 1 13.312 1z"
				/>
				<path
					fill="currentColor"
					d="M8.5 17.598a1 1 0 0 0-1.462 1.139l.506 1.789.034.122c.14.5.28 1 .588 1.393a2.5 2.5 0 0 0 1.022.773c.461.189.981.188 1.5.186h2.624c.519.002 1.039.003 1.5-.186a2.5 2.5 0 0 0 1.022-.773c.308-.393.448-.893.588-1.393l.034-.122.506-1.79a1 1 0 0 0-1.462-1.138q-.17.098-.352.174c-.225.093-.52.158-1.027.193C13.605 18 12.946 18 12 18c-.945 0-1.605 0-2.12-.035-.507-.035-.803-.1-1.028-.193a3 3 0 0 1-.352-.174Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18 11v2c0 1.864 0 2.796-.305 3.53a4 4 0 0 1-2.164 2.165C14.796 19 13.864 19 12 19s-2.796 0-3.53-.305a4 4 0 0 1-2.166-2.164C6 15.796 6 14.864 6 13v-2c0-1.864 0-2.796.304-3.53A4 4 0 0 1 8.47 5.303C9.204 5 10.136 5 12 5s2.796 0 3.53.304a4 4 0 0 1 2.165 2.165C18 8.204 18 9.136 18 11Zm0 0h1v-1h-1"
			/>
		</svg>
	)
}

export default IconAppleWatchDuoSolid
