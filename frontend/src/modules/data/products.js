// Product Master Initial Data
// SKU Format: CAT-BRAND-SIZE-AUTONUMBER

export const seedProductMaster = [
    {
        id: 1,
        sku: 'SH-URB-M-00001',
        name: 'Cotton Kurta',
        brand: 'UrbanWear',
        category: 'Shirts',
        size: 'M',
        color: 'White',
        mrp: 1200,
        discountPercent: 10,
        finalPrice: 1080,
        stock: 100,
        barcodeSimulation: 'SH-URB-M-00001'
    },
    {
        id: 2,
        sku: 'SH-URB-L-00002',
        name: 'Cotton Kurta',
        brand: 'UrbanWear',
        category: 'Shirts',
        size: 'L',
        color: 'White',
        mrp: 1200,
        discountPercent: 10,
        finalPrice: 1080,
        stock: 50,
        barcodeSimulation: 'SH-URB-L-00002'
    },
    {
        id: 3,
        sku: 'JE-DEN-32-00003',
        name: 'Denim Jacket',
        brand: 'DenimCo',
        category: 'Jeans',
        size: '32',
        color: 'Blue',
        mrp: 2500,
        discountPercent: 20,
        finalPrice: 2000,
        stock: 80,
        barcodeSimulation: 'JE-DEN-32-00003'
    },
    {
        id: 4,
        sku: 'DR-SUM-S-00004',
        name: 'Silk Saree',
        brand: 'StyleUp',
        category: 'Dresses',
        size: 'S',
        color: 'Rose Pink',
        mrp: 3200,
        discountPercent: 15,
        finalPrice: 2720,
        stock: 40,
        barcodeSimulation: 'DR-SUM-S-00004'
    }
];
