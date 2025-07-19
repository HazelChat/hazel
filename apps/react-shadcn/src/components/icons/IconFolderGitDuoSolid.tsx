// icons/svgs/duo-solid/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconFolderGitDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.806 2c.377 0 .758-.001 1.118.108a2.5 2.5 0 0 1 .86.46c.291.24.502.557.71.871l.05.075.576.863c.295.442.335.485.365.51a.5.5 0 0 0 .173.092c.037.011.095.021.626.021h2.359c1.084 0 1.958 0 2.666.058.729.06 1.369.185 1.961.487a5 5 0 0 1 2.185 2.185c.302.593.428 1.233.487 1.962.058.707.058 1.582.058 2.665V13.4c0 .659-.785 1.067-1.41.858A5 5 0 0 0 20 14a4.98 4.98 0 0 0-2.998.999A5 5 0 1 0 10 16v5a1 1 0 0 1-1 1h-.644c-1.084 0-1.958 0-2.666-.059-.728-.06-1.369-.185-1.961-.487a5 5 0 0 1-2.185-2.185c-.302-.592-.428-1.232-.487-1.961C1 16.6 1 15.727 1 14.643V9.357c0-1.083 0-1.958.058-2.665.06-.73.185-1.37.487-1.962A5 5 0 0 1 3.73 2.545c.592-.302 1.233-.427 1.961-.487C6.4 2 7.273 2 8.357 2z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M13 9a3 3 0 0 0-1 5.83V22a1 1 0 1 0 2 0v-3.5a5.95 5.95 0 0 0 3.151 1.442 3.001 3.001 0 1 0 .048-2.018 3.93 3.93 0 0 1-3.123-3.123A3.001 3.001 0 0 0 13 9Z"
			/>
		</svg>
	)
}

export default IconFolderGitDuoSolid
