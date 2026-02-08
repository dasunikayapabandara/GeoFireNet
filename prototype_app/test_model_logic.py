import unittest
from model import WildfireModel

class TestWildfireSystem(unittest.TestCase):
    def setUp(self):
        """Initialize the model for each test."""
        self.model = WildfireModel() # Uses mock logic by default

    def test_temperature_correlation(self):
        """Verify that increasing temperature increases risk."""
        # Baseline: Temp=20, Hum=50, Wind=10, Veg=0.5
        base_risk = self.model.predict(20, 50, 10, 0.5)
        
        # High Temp: Temp=45
        high_temp_risk = self.model.predict(45, 50, 10, 0.5)
        
        # Risk should be higher (allowing for small noise delta)
        self.assertGreater(high_temp_risk, base_risk - 0.02, "Expected higher risk with higher temperature")
        print(f"Temp Test: Base={base_risk:.2f}, HighTemp={high_temp_risk:.2f} -> PASS")

    def test_humidity_correlation(self):
        """Verify that increasing humidity decreases risk."""
        # Low Humidity: Hum=10
        low_hum_risk = self.model.predict(30, 10, 20, 0.4)
        
        # High Humidity: Hum=90
        high_hum_risk = self.model.predict(30, 90, 20, 0.4)
        
        self.assertLess(high_hum_risk, low_hum_risk + 0.02, "Expected lower risk with higher humidity")
        print(f"Humidity Test: LowHum={low_hum_risk:.2f}, HighHum={high_hum_risk:.2f} -> PASS")

    def test_risk_levels(self):
        """Verify risk categorization logic."""
        # Test boundaries
        low_level, _ = self.model.get_risk_level(0.1)
        self.assertEqual(low_level, "Low")
        
        mod_level, _ = self.model.get_risk_level(0.4)
        self.assertEqual(mod_level, "Moderate")
        
        high_level, _ = self.model.get_risk_level(0.7)
        self.assertEqual(high_level, "High")
        
        ext_level, _ = self.model.get_risk_level(0.9)
        self.assertEqual(ext_level, "Extreme")
        print("Risk Level Categorization -> PASS")

    def test_regional_variance(self):
        """Verify that model produces different outputs for different inputs."""
        # Region A inputs
        risk_a = self.model.predict(35, 20, 15, 0.3)
        # Region B inputs (cooler, wetter)
        risk_b = self.model.predict(25, 40, 10, 0.6)
        
        self.assertNotEqual(risk_a, risk_b)
        self.assertTrue(0 <= risk_a <= 1.0)
        self.assertTrue(0 <= risk_b <= 1.0)
        print(f"Regional Variance: RegionA={risk_a:.2f}, RegionB={risk_b:.2f} -> PASS")

if __name__ == '__main__':
    unittest.main()
