const reportService = require('./report.service');
const { sendSuccess, sendError } = require('../../utils/response.handler');

const getDailySales = async (req, res, next) => {
    try {
        const { date } = req.query;
        const report = await reportService.getDailySalesReport(date);
        return sendSuccess(res, { report: report[0] || { totalRevenue: 0, totalSales: 0 } }, 'Daily sales report retrieved');
    } catch (err) {
        next(err);
    }
};

const getMonthlySales = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return sendError(res, 'Month and Year are required', 400);

        const report = await reportService.getMonthlySalesReport(parseInt(month), parseInt(year));
        return sendSuccess(res, { report }, 'Monthly sales report retrieved');
    } catch (err) {
        next(err);
    }
};

const getStoreWiseSales = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportService.getStoreWiseSales(startDate, endDate);
        return sendSuccess(res, { report }, 'Store-wise sales report retrieved');
    } catch (err) {
        next(err);
    }
};

const getProductWiseSales = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportService.getProductWiseSales(startDate, endDate);
        return sendSuccess(res, { report }, 'Product-wise sales report retrieved');
    } catch (err) {
        next(err);
    }
};

const getFabricConsumption = async (req, res, next) => {
    try {
        const report = await reportService.getFabricConsumption();
        return sendSuccess(res, { report }, 'Fabric consumption report retrieved');
    } catch (err) {
        next(err);
    }
};

const getLowStockReport = async (req, res, next) => {
    try {
        const report = await reportService.getLowStockReport();
        return sendSuccess(res, { report }, 'Low stock report retrieved');
    } catch (err) {
        next(err);
    }
};

const getReturnSummary = async (req, res, next) => {
    try {
        const report = await reportService.getReturnSummary();
        return sendSuccess(res, { report }, 'Return summary report retrieved');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDailySales,
    getMonthlySales,
    getStoreWiseSales,
    getProductWiseSales,
    getFabricConsumption,
    getLowStockReport,
    getReturnSummary
};
