import * as reportService from "../services/report.service.js";

export const getDashboard = async (req, res) => {
  const data = await reportService.getDashboardData();
  console.log("the data is", data);
  res.json(data);
};
