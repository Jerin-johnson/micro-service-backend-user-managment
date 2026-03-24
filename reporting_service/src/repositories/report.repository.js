import UserReport from "../models/userReport.model.js";

export const getTotalUsers = () => {
  return UserReport.countDocuments();
};

export const getRoleStats = () => {
  return UserReport.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);
};

export const getMonthlyGrowth = () => {
  return UserReport.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        users: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

export const getWeeklySignups = () => {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  return UserReport.aggregate([
    { $match: { createdAt: { $gte: last7Days } } },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        signups: { $sum: 1 },
      },
    },
  ]);
};
