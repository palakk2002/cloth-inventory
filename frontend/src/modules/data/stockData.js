// Seed stock data for shops
// These are loaded into AdminContext as initial shopStock data

export const seedStockData = [
    {
        id: 1,
        shopId: 1,
        fabricProductId: 1,
        productName: 'Cotton Kurta',
        currentStock: 12,
        sellingPrice: 850,
        lowStockThreshold: 5,
    },
    {
        id: 2,
        shopId: 1,
        fabricProductId: 3,
        productName: 'Denim Jacket',
        currentStock: 5,
        sellingPrice: 1800,
        lowStockThreshold: 3,
    },
    {
        id: 3,
        shopId: 2,
        fabricProductId: 2,
        productName: 'Silk Saree',
        currentStock: 5,
        sellingPrice: 3200,
        lowStockThreshold: 3,
    },
    {
        id: 4,
        shopId: 2,
        fabricProductId: 1,
        productName: 'Cotton Kurta',
        currentStock: 8,
        sellingPrice: 850,
        lowStockThreshold: 5,
    },
];
