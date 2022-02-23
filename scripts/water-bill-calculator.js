class WaterBillCalculator {
    constructor(totalCubicMeters) {
        this.totalCubicMeters = totalCubicMeters;
        this.pendingCubicMeters = totalCubicMeters;
        this.currentInterval = 0;
        this.currentBasicCharge = 0;
        this.intervals = [
            [10, 111.27, 'conn.', 'First 10'],
            [10, 13.56, 'cu.m.', 'Next 10'],
            [20, 25.71, 'cu.m.', 'Next 20'],
            [20, 33.89, 'cu.m.', 'Next 20'],
            [20, 39.58, 'cu.m.', 'Next 20'],
            [20, 41.49, 'cu.m.', 'Next 20'],
            [50, 43.34, 'cu.m.', 'Next 50'],
            [50, 45.2, 'cu.m.', 'Next 50'],
            [200, 47.06, 'cu.m.', 'Over 200'],
        ];
    }

    calculateBasicCharge() {
        const [cap, rate, unit, name] = this.__getCurrentInterval();

        const [previousCharge, newCharge, chargedCubicMeters] =
            this.__processCharge(cap, rate);

        this.currentBasicCharge = newCharge;
        this.pendingCubicMeters = this.pendingCubicMeters - cap;

        const breakdownCharge = newCharge - previousCharge;

        if (this.pendingCubicMeters > 0) {
            this.currentInterval = this.currentInterval + 1;
            return this.calculateBasicCharge();
        }

        return this.currentBasicCharge;
    }

    calculateFCDA() {
        return this.currentBasicCharge * 0.0262;
    }

    calculateWaterCharge() {
        return this.currentBasicCharge + this.calculateFCDA();
    }

    calculateEnvironmentalCharge() {
        return this.calculateWaterCharge() * 0.2;
    }

    calculateMaintenanceServiceCharge() {
        return 4.0;
    }

    calculateVAT() {
        return (
            (this.calculateWaterCharge() +
                this.calculateEnvironmentalCharge() +
                this.calculateMaintenanceServiceCharge()) *
            0.12
        );
    }

    calculateMonthlyBill() {
        if (this.currentBasicCharge === 0) {
            this.calculateBasicCharge();
        }

        return (
            this.calculateWaterCharge() +
            this.calculateEnvironmentalCharge() +
            this.calculateVAT() +
            this.calculateMaintenanceServiceCharge()
        );
    }

    __processCharge(cap, rate) {
        const previousCharge = this.currentBasicCharge;
        const chargedCubicMeters = this.__getChargedCubicMeters(cap);
        let newCharge = 0;

        if (this.__isFirstRate(this.currentInterval)) {
            newCharge = rate;

            if (chargedCubicMeters < 10) {
                newCharge = 63.16;
            }

            return [previousCharge, newCharge, chargedCubicMeters];
        }

        newCharge = previousCharge + chargedCubicMeters * rate;
        return [previousCharge, newCharge, chargedCubicMeters];
    }

    __getChargedCubicMeters(cap) {
        if (this.pendingCubicMeters > cap) {
            return cap;
        } else {
            return this.pendingCubicMeters;
        }
    }

    __isFirstRate(interval) {
        return interval === 0;
    }

    __getCurrentInterval() {
        return this.intervals[this.currentInterval];
    }
}

module.exports = WaterBillCalculator;
