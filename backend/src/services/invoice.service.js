/** invoice.service.js — Invoice number and generation stub */
const Invoice = require('../models/invoice.model');
const { generateInvoiceNumber } = require('../core/invoiceNumber.generator');

const getNextInvoiceNumber = async () => {
    const count = await Invoice.countDocuments();
    return generateInvoiceNumber(count + 1);
};

module.exports = { getNextInvoiceNumber };
