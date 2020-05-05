// This transport enables winston logging to send messages to pager duty

const Transport = require("winston-transport");
const { RoboCaller } = require("./RoboCaller");
const pdClient = require("node-pagerduty");

module.exports = class PagerDutyTransport extends Transport {
  constructor(winstonOpts, pagerDutyOptions) {
    super(winstonOpts);
    this.serviceId = pagerDutyOptions.pdServiceId;
    this.pd = new pdClient(pagerDutyOptions.pdApiToken);
  }

  async log(info, callback) {
    console.log("message", info);
    this.pd.incidents
      .createIncident("chris@umaproject.org", {
        incident: {
          type: "incident",
          title: `${info.level}: ${info.at} ⭢ ${info.message}`,
          service: {
            id: this.serviceId,
            type: "service_reference"
          },
          urgency: info.level == "info" ? "high" : "low",
          body: {
            type: "incident_body",
            details: info.mrkdwn ? info.mrkdwn : info.message
          }
        }
      })
      .then(res => {
        console.log("sent pagerduty message");
      })
      .catch(err => {
        console.log(err);
      });
    callback();
  }
};
