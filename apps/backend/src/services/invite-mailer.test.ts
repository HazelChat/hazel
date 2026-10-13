import { describe, expect, it } from "vitest"
import { renderInviteEmail } from "./invite-mailer"

describe("renderInviteEmail", () => {
	it("escapes names in the HTML and keeps the plain text readable", () => {
		const email = renderInviteEmail({
			to: "ada@hazel.test",
			organizationName: `<script>alert("x")</script> & Co`,
			inviterName: "Grace",
			acceptUrl: "https://app.hazel.sh/invite/abc",
		})
		expect(email.subject).toBe(`Grace invited you to <script>alert("x")</script> & Co on Hazel`)
		expect(email.html).not.toContain("<script>")
		expect(email.html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; Co")
		expect(email.html).toContain('href="https://app.hazel.sh/invite/abc"')
		expect(email.text).toContain("Accept the invitation: https://app.hazel.sh/invite/abc")
	})
})
