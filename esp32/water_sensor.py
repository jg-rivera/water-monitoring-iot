from machine import Pin, ADC


class WaterFlowSensor:

    def __init__(self, pin_number, tag):
        self.pot = ADC(Pin(pin_number))
        self.pot.width(ADC.WIDTH_10BIT)
        self.pot.atten(ADC.ATTN_11DB)
        self.volume = 0
        self.tag = tag

    def read(self):
        liters_per_hour = self.pot.read()
        self.volume = self.volume + \
            self.__to_liters_per_second(liters_per_hour)
        return (liters_per_hour, self.volume)

    def __to_liters_per_second(self, liters_per_hour):
        return liters_per_hour / 3600
