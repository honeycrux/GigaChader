// This is a backend service that schedules jobs with cron

import cron from "node-cron";
import { checkExchange } from "./lib/helpers/crypto";
import { expireOldMediaStashes, expireOldNotifications } from "./lib/helpers/expirables";

function initializeJobs() {
    // Schedule tasks that runs at the first minute of every two hours
    cron.schedule("0 */2 * * *", function () {
        try {
            console.log("[jobs] Run checkExchange");
            checkExchange();
        } catch (e) {
            console.log("[jobs] Error on job: checkExchange");
            console.log(e);
        }
        try {
            console.log("[jobs] Run expireOldNotifications");
            expireOldNotifications();
        } catch (e) {
            console.log("[jobs] Error on job: expireOldNotifications");
            console.log(e);
        }
        try {
            console.log("[jobs] Run expireOldMediaStashes");
            expireOldMediaStashes();
        } catch (e) {
            console.log("[jobs] Error on job: expireOldMediaStashes");
            console.log(e);
        }
    });
    console.log("💼 Cron jobs initialized");
}

initializeJobs();
