jest.mock('../src/Models/Vehicle', () => ({
  findByPk: jest.fn()
}));

jest.mock('../src/Models/SystemSettings', () => ({
  get: jest.fn()
}));

const Vehicle = require('../src/Models/Vehicle');
const SystemSettings = require('../src/Models/SystemSettings');
const { calculatePrice } = require('../src/Utils/PriceCalculator');

describe('PriceCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SystemSettings.get.mockResolvedValue(0.1);
  });

  it('calculates rental totals with insurance and tax', async () => {
    Vehicle.findByPk.mockResolvedValue({
      dailyRate: 100,
      depositRate: 0.2,
      insuranceRate: 0.1
    });

    const result = await calculatePrice({
      vehicleId: 'veh-1',
      serviceType: 'rental',
      startDate: '2026-03-20',
      endDate: '2026-03-23'
    });

    expect(result.basePrice).toBe(300);
    expect(result.insurancePrice).toBeCloseTo(0.3, 5);
    expect(result.tax).toBeCloseTo(30.03, 5);
    expect(result.total).toBeCloseTo(330.33, 5);
  });

  it('uses listed price for non-rental service types', async () => {
    const result = await calculatePrice({
      serviceType: 'sales',
      listedPrice: 5000,
      startDate: '2026-03-20',
      endDate: '2026-03-20'
    });

    expect(result.basePrice).toBe(5000);
    expect(result.total).toBe(5500);
  });
});
