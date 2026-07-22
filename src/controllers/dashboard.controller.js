import { success } from '../utils/ApiResponse.js';
import * as dashboardService from '../services/dashboard.service.js';

/**
 * GET /dashboard
 */
export async function getDashboard(req, res) {
  const data = await dashboardService.getDashboard();
  return success(res, data, 'Dashboard retrieved');
}
