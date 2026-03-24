import * as repo from "../repositories/report.repository.js";

export const getDashboardData = async () => {
  const [total, roles, growth, weekly] = await Promise.all([
    repo.getTotalUsers(),
    repo.getRoleStats(),
    repo.getMonthlyGrowth(),
    repo.getWeeklySignups(),
  ]);

  return {
    totalUsers: total,
    roleStats: roles,
    growthData: growth,
    signupData: weekly,
  };
};
