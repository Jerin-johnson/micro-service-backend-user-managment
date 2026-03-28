import UserReport from "../models/userReport.model.js";

export const getTotalUsers = () => {
  return UserReport.countDocuments();
};

export const getRoleStats = () => {
  return UserReport.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        role: "$_id",
        count: 1,
      },
    },
  ]);
};

export const getMonthlyGrowth = async () => {
  const data = await UserReport.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        users: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const monthMap = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec",
  };

  return data.map((item) => ({
    month: monthMap[item._id],
    users: item.users,
  }));
};

export const getWeeklySignups = async () => {
  const today = new Date();
  const last7Days = new Date();
  last7Days.setDate(today.getDate() - 6);

  const data = await UserReport.aggregate([
    {
      $match: {
        createdAt: { $gte: last7Days },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        signups: { $sum: 1 },
      },
    },
  ]);

  const dayMap = {
    1: "Sun",
    2: "Mon",
    3: "Tue",
    4: "Wed",
    5: "Thu",
    6: "Fri",
    7: "Sat",
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const result = days.map((day) => {
    const found = data.find((d) => dayMap[d._id] === day);
    return {
      day,
      signups: found ? found.signups : 0,
    };
  });

  return result;
};
