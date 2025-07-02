import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

crons.interval("cleanupOldTypingIndicators", { hours: 1 }, internal.typingIndicator.cleanupOld)

export default crons
